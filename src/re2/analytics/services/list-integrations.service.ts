import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { GenerateDateRangeFilter } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (query: Re2AnalyticQueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.shopifyIntegrationRepository)
      .addRelation('integration')
      .create()

    results.condition.andWhere(`"integration"."userId" = :userId`, { userId })

    const date_query_condition = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'donation',
      condition: ' AND ',
    })

    results.condition.innerJoinAndSelect(
      're2_shopify_sale_portion_settings',
      'sale_portion',
      `"sale_portion"."shopifyIntegrationId" = "data"."id" AND "sale_portion"."status" != '${IntegrationStatus.DELETED}'`,
    )
    results.condition.innerJoinAndSelect(
      're2_shopify_cart_banner_settings',
      'cart_banner',
      `"cart_banner"."shopifyIntegrationId" = "data"."id" AND "cart_banner"."status" != '${IntegrationStatus.DELETED}'`,
    )
    results.condition.innerJoinAndSelect(
      're2_shopify_cart_drawer_settings',
      'cart_drawer',
      `"cart_drawer"."shopifyIntegrationId" = "data"."id" AND "cart_drawer"."status" != '${IntegrationStatus.DELETED}'`,
    )

    results.condition.leftJoinAndSelect(
      `(SELECT 
          "payment"."reference_id",
          COUNT(DISTINCT "donation"."userId") AS contributors,
          COALESCE(SUM("donation".amount), 0) AS gross_donation,
          COALESCE(SUM("donation".amount - "donation"."system_fees"), 0) AS net_donation,
          MAX("donation".created) AS last_donation
        FROM "user_donations" "donation"
        JOIN "user_donation_payment" "payment" 
        ON "payment"."id" = "donation"."userDonationPaymentId"
        WHERE "donation"."reason" IN (
          '${DonationType.INTEGRATION_CART_BANNER}', 
          '${DonationType.INTEGRATION_CART_DRAWER}', 
          '${DonationType.INTEGRATION_SALES_PORTION}'
        )
        AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        ${date_query_condition}
        GROUP BY "payment"."reference_id"
      )`,
      'donations',
      '"donations"."reference_id" = "data"."id"',
    )

    results.condition.select([
      'data.id AS id',
      'data.shop AS shop',
      `CASE 
        WHEN sale_portion.id IS NOT NULL THEN sale_portion.name
        WHEN cart_banner.id IS NOT NULL THEN cart_banner.name
        WHEN cart_drawer.id IS NOT NULL THEN cart_drawer.name
        ELSE NULL
      END AS integration_name`,
      `CASE 
        WHEN sale_portion.id IS NOT NULL THEN 'SALES_PORTION'
        WHEN cart_banner.id IS NOT NULL THEN 'CART_BANNER'
        WHEN cart_drawer.id IS NOT NULL THEN 'CART_DRAWER'
        ELSE NULL
      END AS integration_type`,
      'donations.contributors AS contributors',
      'donations.gross_donation AS gross_donation',
      'donations.last_donation AS last_donation',
    ])

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        'Shopify Integration Name': item.integration_name,
        'Shopify Store URL': `https://${item.shop}`,
        'Shopify Integration Type': item.integration_type,
        Contributors: item.contributors,
        'Gross Donation': item.gross_donation,
        'Last Donation': item.last_donation,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    results.condition.orderBy('"donations"."last_donation"', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
