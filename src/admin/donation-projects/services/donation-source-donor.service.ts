import { In } from 'typeorm'
import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface, ICsvDonationSourceDonor } from '@app/src/shared/interfaces'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { DonationSourceDonorQueryDto } from '@app/src/admin/donation-projects/dto'
import { DONATION_STATUS, DonationFrequency, DonationType } from '@app/src/donations/enums'

export default async function (
  id: string,
  query: DonationSourceDonorQueryDto,
  isExport = false,
): Promise<PaginateRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: In([
              DonationProjectStatus.ENDED,
              DonationProjectStatus.PUBLISHED,
              DonationProjectStatus.SUSPENDED,
              DonationProjectStatus.TO_BE_CANCELLED,
            ]),
          },
        },
      ],
      errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('donation_project', id)
      .addRelation('user')
      .addRelation('payment_currency')
      .addRelation('user_deal_item_payment')
      .addRelation('user_donation_payment')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .useQuery(this.donationRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    if (query?.source_id) {
      results.condition.andWhere('"user_deal_item_payment"."dealId" = :donationSourceId', {
        donationSourceId: query.source_id,
      })
    }

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

    results.condition.select([
      'user.id',
      'user.username username',
      'user.display_name display_name',
      'profile.social_accounts social_accounts',
      'profile_images.url profile_image',
      'data.id id',
      'data.amount amount',
      'data.system_fees system_fees',
      'data.gas_fees gas_fees',
      'data.created created',
      'payment_currency.id currency_id',
      'payment_currency.name currency_name',
      'payment_currency.logo_uri currency_logo_uri',
      `CASE
          WHEN "data"."is_recurring"
            THEN '${DonationFrequency.RECURRING}'
          ELSE '${DonationFrequency.ONE_TIME}'
        END donation_frequency`,
      'user.account_type user_account_type',
      'user.account_status user_account_status',
      'user.is_verified user_is_verified',
      `CASE
        WHEN "data"."reason" IN (
          '${DonationType.FUNDRAISER_FORM}',
          '${DonationType.FUNDRAISER_PAGE}'
        )
          THEN (
            SELECT json_build_object(
              'sourceType', "data"."reason",
              'title', f."title",
              'public_url', f."public_url",
              'company_name', p."company_name"
            )
            FROM "re2_fundraisers" f
            JOIN "re2_users" uf ON uf."id" = f."userId"
            JOIN "re2_profiles" p ON p."userId" = uf."id"
            WHERE f."id" = "user_donation_payment"."reference_id"
              AND f."type"::text = (
                CASE
                  WHEN "data"."reason" = '${DonationType.FUNDRAISER_FORM}'
                    THEN '${FundraiserType.FORM}'
                  WHEN "data"."reason" = '${DonationType.FUNDRAISER_PAGE}'
                    THEN '${FundraiserType.PAGE}'
                END
              )
          )

        WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
          THEN (
            SELECT json_build_object(
              'sourceType', "data"."reason",
              'title', cb."name",
              'public_url', 'https://' || si."shop",
              'company_name', p."company_name"
            )
            FROM "re2_shopify_cart_banner_settings" cb
            JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
            JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
            JOIN "re2_profiles" p ON i2."userId" = p."userId"
            WHERE cb."id" = "user_donation_payment"."reference_id"
          )

        WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
          THEN (
            SELECT json_build_object(
              'sourceType', "data"."reason",
              'title', cd."name",
              'public_url', 'https://' || si."shop",
              'company_name', p."company_name"
            )
            FROM "re2_shopify_cart_drawer_settings" cd
            JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
            JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
            JOIN "re2_profiles" p ON i2."userId" = p."userId"
            WHERE cd."id" = "user_donation_payment"."reference_id"
          )

        WHEN "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
          THEN (
            SELECT json_build_object(
              'sourceType', "data"."reason",
              'title', sp."name",
              'public_url', 'https://' || si."shop",
              'company_name', p."company_name"
            )
            FROM "re2_shopify_sale_portion_settings" sp
            JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
            JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
            JOIN "re2_profiles" p ON i2."userId" = p."userId"
            WHERE sp."id" = "user_donation_payment"."reference_id"
          )
      END re2_source`,
    ])

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: ICsvDonationSourceDonor[] = data.map(this.toCSVDonationSourceDonor)

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
