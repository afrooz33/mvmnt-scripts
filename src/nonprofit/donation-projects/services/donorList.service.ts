import { In } from 'typeorm'
import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DonorListQueryDto } from '@app/src/nonprofit/donation-projects/dto'
import { DONATION_STATUS, DonationFrequency, DonationType } from '@app/src/donations/enums'

export default async function getDonorsAllSources(
  id: string,
  userId: string,
  query: DonorListQueryDto,
  isExport: boolean,
): Promise<PaginateRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: { id: userId },
            status: In([Status.ENDED, Status.TO_BE_CANCELLED, Status.PUBLISHED]),
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('donation_project', id)
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.deal')
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('user.profile.profile_images')
      .addRelation('user_donation_payment')
      .useQuery(this.donationRepository)
      .create()

    if (query.amount?.start) {
      results.condition.andWhere('"data"."amount" >= :start', {
        start: query.amount.start,
      })
    }
    if (query.amount?.end) {
      results.condition.andWhere('"data"."amount" <= :end', {
        end: query.amount.end,
      })
    }

    if (query.keyword) {
      results.condition.andWhere(`"user"."display_name" ILIKE :search`, {
        search: `%${query.keyword}%`,
      })

      results.condition.orWhere(`"user"."username" ILIKE :search`, {
        search: `%${query.keyword}%`,
      })

      results.condition.orWhere(`"deal"."name" ILIKE :search`, {
        search: `%${query.keyword}%`,
      })

      results.condition.orWhere(
        `
          "data"."reason" IN ('${DonationType.FUNDRAISER_FORM}','${DonationType.FUNDRAISER_PAGE}')
          AND EXISTS (
            SELECT 1
            FROM "re2_fundraisers" f
              JOIN "re2_users" uf ON f."userId" = uf."id"
              JOIN "re2_profiles" pf ON uf."id" = pf."userId"
            WHERE f."id" = "user_donation_payment"."reference_id"
              AND (
                f."title" ILIKE :search
                OR f."public_url" ILIKE :search
                OR pf."company_name" ILIKE :search
              )
          )
        `,
        { search: `%${query.keyword}%` },
      )

      results.condition.orWhere(
        `
          "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
          AND EXISTS (
            SELECT 1
            FROM "re2_shopify_cart_banner_settings" cb
              JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i ON si."integrationId" = i."id"
              JOIN "re2_profiles" p ON i."userId" = p."userId"
            WHERE cb."id" = "user_donation_payment"."reference_id"
              AND (
                cb."name" ILIKE :search
                OR si."shop" ILIKE :search
                OR p."company_name" ILIKE :search
              )
          )
        `,
        { search: `%${query.keyword}%` },
      )

      results.condition.orWhere(
        `
          "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
          AND EXISTS (
            SELECT 1
            FROM "re2_shopify_cart_drawer_settings" cd
              JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i ON si."integrationId" = i."id"
              JOIN "re2_profiles" p ON i."userId" = p."userId"
            WHERE cd."id" = "user_donation_payment"."reference_id"
              AND (
                cd."name" ILIKE :search
                OR si."shop" ILIKE :search
                OR p."company_name" ILIKE :search
              )
          )
        `,
        { search: `%${query.keyword}%` },
      )

      results.condition.orWhere(
        `
          "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
          AND EXISTS (
            SELECT 1
            FROM "re2_shopify_sale_portion_settings" sp
              JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i ON si."integrationId" = i."id"
              JOIN "re2_profiles" p ON i."userId" = p."userId"
            WHERE sp."id" = "user_donation_payment"."reference_id"
              AND (
                sp."name" ILIKE :search
                OR si."shop" ILIKE :search
                OR p."company_name" ILIKE :search
              )
          )
        `,
        { search: `%${query.keyword}%` },
      )
    }

    results.condition.andWhere('"data"."status" IN (:...statuses)', {
      statuses: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    if (query?.donation_type) {
      results.condition.andWhere('"data"."reason" = :donation_type', {
        donation_type: query.donation_type,
      })
    }

    results.condition.select([
      'data.id id',
      'data.amount amount',
      'data.reason reason',
      'data.is_recurring is_recurring',
      'user.id user_id',
      'user.display_name display_name',
      'user.username username',
      'user.account_type account_type',
      'user.is_verified is_verified',
      'profile.id profile_id',
      'profile.social_accounts social_accounts',
      `
        (CASE
          WHEN "user_deal_item_payment"."id" IS NOT NULL
            THEN json_build_object(
              'sourceType', 'deal',
              'dealName', "deal"."name",
              'dealId', "deal"."id",
              'dealType', "deal"."deal_type"
            )

          WHEN "data"."reason" IN (
            '${DonationType.FUNDRAISER_FORM}',
            '${DonationType.FUNDRAISER_PAGE}'
          )
            THEN (
              SELECT json_build_object(
                'title', f."title",
                'public_url', f."public_url",
                'company_name', p."company_name"
              )
              FROM "re2_fundraisers" f
              JOIN "re2_users" u2 ON f."userId" = u2."id"
              JOIN "re2_profiles" p ON u2."id" = p."userId"
              WHERE f."id" = "user_donation_payment"."reference_id"
                AND f."type"::text = (
                  CASE
                    WHEN "data"."reason" = '${DonationType.FUNDRAISER_FORM}' THEN '${FundraiserType.FORM}'
                    WHEN "data"."reason" = '${DonationType.FUNDRAISER_PAGE}' THEN '${FundraiserType.PAGE}'
                  END
                )
            )

          WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
            THEN (
              SELECT json_build_object(
                'title', cb."name",
                'shop_url', 'https://' || si."shop",
                'company_name', p."company_name"
              )
              FROM "re2_shopify_cart_banner_settings" cb
              JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i ON si."integrationId" = i."id"
              JOIN "re2_profiles" p ON i."userId" = p."userId"
              WHERE cb."id" = "user_donation_payment"."reference_id"
            )

          WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
            THEN (
              SELECT json_build_object(
                'title', cd."name",
                'shop_url', 'https://' || si."shop",
                'company_name', p."company_name"
              )
              FROM "re2_shopify_cart_drawer_settings" cd
              JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i ON si."integrationId" = i."id"
              JOIN "re2_profiles" p ON i."userId" = p."userId"
              WHERE cd."id" = "user_donation_payment"."reference_id"
            )

          WHEN "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
            THEN (
              SELECT json_build_object(
                'title', sp."name",
                'shop_url', 'https://' || si."shop",
                'company_name', p."company_name"
              )
              FROM "re2_shopify_sale_portion_settings" sp
              JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i ON si."integrationId" = i."id"
              JOIN "re2_profiles" p ON i."userId" = p."userId"
              WHERE sp."id" = "user_donation_payment"."reference_id"
            )

          ELSE json_build_object('sourceType', 'direct_donation')
        END)
        AS source_details
      `,
    ])

    if (isExport) {
      const data = await results.condition.getMany()

      if (!data.length) {
        return
      }

      const csvData = data.map((data) => {
        return {
          username: data.user.username,
          account_type: data.user.account_type,
          deal_name: data.deal.name,
          deal_type: data.deal.deal_type,
          donation_frequency: data.is_recurring
            ? DonationFrequency.RECURRING
            : DonationFrequency.ONE_TIME,
          amount: data.amount,
          donation_start_date: data.donation_start_date,
        }
      })

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
