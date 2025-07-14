import { ExportToCsv } from 'export-to-csv'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetTotalRe2DonationQuery,
  GetRe2SourceDonationQuery,
  GetDonationProjectImageQuery,
} from '@app/src/shared/sql'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

function BuildDonationSubquery(userId: string, query: Re2AnalyticQueryDto) {
  return `(
    SELECT
      JSON_BUILD_OBJECT(
        'gross_donation', gross_donation,
        'net_donation', net_donation
      )
      FROM (
        ${GetRe2SourceDonationQuery({
          re2Id: userId,
          isDirect: false,
          nonprofitId: '"data"."userId"',
          dateFilter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
          select:
            'COALESCE(SUM("donation"."amount" - "donation"."system_fees"), 0) gross_donation, COALESCE(SUM("donation"."amount"), 0) net_donation',
        })}
      )
  )`
}

function BuildFundraiserCountSubquery(userId: string) {
  return `(
    SELECT COUNT(DISTINCT "fundraiser"."id")
    FROM "re2_fundraisers" "fundraiser"
    INNER JOIN "user_donation_payment" "payment" ON "payment"."reference_id" = "fundraiser"."id"
    INNER JOIN "user_donations" "donation" ON "donation"."userDonationPaymentId" = "payment"."id"
    WHERE "fundraiser"."userId" = '${userId}'
      AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
  )`
}

function BuildIntegrationCountSubquery(userId: string, settingTable: string) {
  return `(
    SELECT COUNT(DISTINCT "setting"."id")
    FROM "${settingTable}" "setting"
    LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "setting"."shopifyIntegrationId" = "shopify_integration"."id"
    LEFT JOIN "re2_integrations" "integration" ON "integration"."id" = "shopify_integration"."integrationId"
    INNER JOIN "user_donation_payment" "payment" ON "payment"."reference_id" = "setting"."id"
    INNER JOIN "user_donations" "donation" ON "donation"."userDonationPaymentId" = "payment"."id"
    WHERE "integration"."userId" = '${userId}'
      AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
  )`
}

export default async function (query: Re2AnalyticQueryDto, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationProjectRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .create()

    results.condition.andWhere('"data"."status" NOT IN (:...donation_project_status)', {
      donation_project_status: [DonationProjectStatus.DELETED, DonationProjectStatus.DRAFT],
    })

    results.condition.select([
      'data.id id',
      `${GetDonationProjectImageQuery(
        `"data"."id" = "donation_project_images"."donationProjectsId"`,
      )} as image`,
      'data.name name',
      'user.id nonprofit_id',
      'profile.first_name first_name',
      'profile.last_name last_name',
      'profile.foundation_name foundation_name',
      'profile.foundation_url foundation_url',
      BuildDonationSubquery(userId, query) + ' as donation',
      BuildFundraiserCountSubquery(userId) + ' as total_fundraiser_count',
      `${GetTotalRe2DonationQuery({
        re2: userId,
        dateFilter: query?.date_filter,
        reason: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
        isGross: true,
        isFundraiser: true,
      })} as total_fundraiser_donation`,
      `(
        ${BuildIntegrationCountSubquery(userId, 're2_shopify_cart_banner_settings')}
      ) + (
        ${BuildIntegrationCountSubquery(userId, 're2_shopify_cart_drawer_settings')}
      ) + (
        ${BuildIntegrationCountSubquery(userId, 're2_shopify_sale_portion_settings')}
      ) as total_integration_count`,
      `${GetTotalRe2DonationQuery({
        re2: userId,
        dateFilter: query?.date_filter,
        reason: [
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        isGross: true,
        isIntegration: true,
      })} as total_integration_donation`,
    ])

    results.condition.andWhere(
      `"data"."id" IN (
        SELECT "fundraiser_nonprofit"."nonprofitUsersId" FROM "re2_fundraisers_nonprofit_users" "fundraiser_nonprofit"
        LEFT JOIN "re2_fundraisers" "fundraiser" ON "fundraiser"."id" = "fundraiser_nonprofit"."re2FundraisersId"
        WHERE "fundraiser"."userId" = :re2Id

        UNION ALL

        SELECT "sales_portion"."donationProjectsId" FROM "re2_shopify_sale_portion_donation_projects" "sales_portion"
        LEFT JOIN "re2_shopify_sale_portion_settings" "settings" ON "settings"."id" = "sales_portion"."re2ShopifySalePortionSettingsId"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "settings"."shopifyIntegrationId"
        WHERE "shopify_integration"."integrationId" = :re2Id

        UNION ALL

        SELECT "cart_banner"."donationProjectsId" FROM "re2_shopify_cart_banner_donation_projects" "cart_banner"
        LEFT JOIN "re2_shopify_cart_banner_settings" "settings" ON "settings"."id" = "cart_banner"."re2ShopifyCartBannerSettingsId"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "settings"."shopifyIntegrationId"
        WHERE "shopify_integration"."integrationId" = :re2Id

        UNION ALL

        SELECT "cart_drawer"."donationProjectsId" FROM "re2_shopify_cart_drawer_donation_projects" "cart_drawer"
        LEFT JOIN "re2_shopify_cart_drawer_settings" "settings" ON "settings"."id" = "cart_drawer"."re2ShopifyCartDrawerSettingsId"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "settings"."shopifyIntegrationId"
        WHERE "shopify_integration"."integrationId" = :re2Id
      )`,
      {
        re2Id: userId,
      },
    )

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      if (!data.length) {
        throw new NotFoundException(ErrorKey.NO_CSV_DATA_FOUND)
      }

      const csvData = data.map((item) => ({
        id: item.id,
        Name: item.name,
        Nonprofit: item.nonprofit_id,
        'First Name': item.first_name,
        'Last Name': item.last_name,
        'Foundation Name': item.foundation_name,
        'Foundation URL': item.foundation_url,
        'Gross Donation': item.donation.gross_donation,
        'Net Donation': item.donation.net_donation,
        'Total Fundraiser Count': item.total_fundraiser_count,
        'Total Fundraiser Donation': item.total_fundraiser_donation,
        'Total Integration Count': item.total_integration_count,
        'Total Integration Donation': item.total_integration_donation,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
