import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationType } from '@app/src/donations/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (query: DateFilterQueryDto, isExport = false): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.deal')
      .addRelation('user_donation_payment')
      .addRelation('user')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(`"data"."status" IN (:...stList)`, {
      stList: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.andWhere('"data"."reason" IN (:...reasonList)', {
      reasonList: [
        DonationType.FUNDRAISER_FORM,
        DonationType.FUNDRAISER_PAGE,
        DonationType.INTEGRATION_CART_BANNER,
        DonationType.INTEGRATION_CART_DRAWER,
        DonationType.INTEGRATION_SALES_PORTION,
      ],
    })

    results.condition.select([
      `"data"."reason" AS "reason"`,
      `CAST("user_donation_payment"."reference_id" AS text) AS "source_id"`,
      `SUM("data"."amount") AS "total_donation"`,
      `SUM("data"."amount") - SUM("data"."system_fees") AS "gross_donation"`,
      `COUNT(DISTINCT "data"."userId") AS "total_donors"`,
      `
        CASE
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
        END
      AS "source_details"
      `,
    ])

    results.condition.orderBy({
      '"total_donation"': 'DESC',
    })

    results.condition.addGroupBy(`"data"."reason"`)
    results.condition.addGroupBy(`"user_donation_payment"."reference_id"`)

    if (isExport) {
      const data = await results.condition.getRawMany()

      const csvData: [] = data.map((item) => ({
        Reason: item.reason,
        'Source ID': item.source_id,
        'Total Donation': item.total_donation,
        'Gross Donation': item.gross_donation,
        'Total Donors': item.total_donors,
        'Source Details': item.source_details,
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
