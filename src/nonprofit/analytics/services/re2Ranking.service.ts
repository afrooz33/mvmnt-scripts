import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CheckNonprofitDonationQuery } from '@app/src/shared/sql/common.sql'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { DONATION_SOURCE, PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function re2RankingService(
  query: DateFilterQueryDto,
  userId: string,
  isExport: boolean = false,
): Promise<PaginateRO> {
  try {
    /**
     * Build your base query using your custom QueryBuilder class.
     * This attaches the "donation" relation to "data" (donationPaymentRepository).
     */
    const qbData: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationPaymentRepository)
      .addRelation('donation')
      .create()

    // 1. Filter by status
    qbData.condition.andWhere('"data"."status" IN (:...status)', {
      status: [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED],
    })

    // 2. Filter by re2 sources
    qbData.condition.andWhere('"data"."source" IN (:...donation_source)', {
      donation_source: [
        DONATION_SOURCE.FUNDRAISER_FORM,
        DONATION_SOURCE.FUNDRAISER_PAGE,
        DONATION_SOURCE.INTEGRATION_CART_BANNER,
        DONATION_SOURCE.INTEGRATION_CART_DRAWER,
        DONATION_SOURCE.INTEGRATION_SALES_PORTION,
      ],
    })

    // 3. Date filtering (if your `query.date_filter` has start/end)
    if (query?.date_filter?.start) {
      qbData.condition.andWhere('"data"."created" >= :startDate', {
        startDate: query.date_filter.start,
      })
    }
    if (query?.date_filter?.end) {
      qbData.condition.andWhere('"data"."created" <= :endDate', {
        endDate: query.date_filter.end,
      })
    }

    // 4. Nonprofit-specific filter
    qbData.condition.andWhere(CheckNonprofitDonationQuery('donation', userId))

    // 5. Replace the default SELECT columns with our aggregated columns,
    //    window function, and CASE statement for source_details.
    //    First clear out any default selects:
    qbData.condition.select([
      '"data"."reference_id"',
      '"data"."source"',
      'SUM("donation"."amount") AS "total_donations"',
    ])

    // - Add the RANK() window function:
    qbData.condition.addSelect(
      `RANK() OVER (
      PARTITION BY "data"."source"
      ORDER BY SUM("donation"."amount") DESC
    )`,
      'rank',
    )

    // - Add the CASE expression for source_details (using raw SQL)
    qbData.condition.addSelect(
      `
        CASE
          WHEN "data"."source" IN ('${DONATION_SOURCE.FUNDRAISER_FORM}', '${DONATION_SOURCE.FUNDRAISER_PAGE}')
            THEN (
              SELECT json_build_object(
                'title', f."title",
                'public_url', f."public_url",
                'company_name', p."company_name"
              )
              FROM "re2_fundraisers" f
              JOIN "re2_users" u ON f."userId" = u."id"
              JOIN "re2_profiles" p ON u."id" = p."userId"
              WHERE f."id" = "data"."reference_id"
                AND f."type"::text = (
                  CASE
                    WHEN "data"."source" = '${DONATION_SOURCE.FUNDRAISER_FORM}' THEN '${FundraiserType.FORM}'
                    WHEN "data"."source" = '${DONATION_SOURCE.FUNDRAISER_PAGE}' THEN '${FundraiserType.PAGE}'
                  END
                )
            )
          WHEN "data"."source" IN ('${DONATION_SOURCE.INTEGRATION_CART_BANNER}')
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
              WHERE cb."id" = "data"."reference_id"
            )
          WHEN "data"."source" IN ('${DONATION_SOURCE.INTEGRATION_CART_DRAWER}')
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
              WHERE cd."id" = "data"."reference_id"
            )
          WHEN "data"."source" IN ('${DONATION_SOURCE.INTEGRATION_SALES_PORTION}')
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
              WHERE sp."id" = "data"."reference_id"
            )
          ELSE NULL
        END
      `,
      'source_details',
    )

    // 6. GROUP BY reference_id + source
    //    (to make the SUM(...) aggregation valid)
    qbData.condition.groupBy('"data"."reference_id"')
    qbData.condition.addGroupBy('"data"."source"')

    // 7. Sort by total_donations desc
    qbData.condition.orderBy('SUM("donation"."amount")', 'DESC')

    if (isExport) {
      const data = await qbData.condition.getRawMany()

      const csvData = data.map((data) => ({
        reference_id: data.reference_id,
        source: data.source,
        total_donations: data.total_donations,
        rank: data.rank,
        source_details: JSON.stringify(data.source_details),
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    // 8. Return paginated (raw) result
    return await this.rawPaginate(qbData)
  } catch (error) {
    return HandleErrors(error)
  }
}
