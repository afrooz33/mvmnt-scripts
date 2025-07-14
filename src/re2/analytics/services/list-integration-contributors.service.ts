import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationType } from '@app/src/donations/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'

export default async function (
  id: string,
  query: Re2AnalyticQueryDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user')
      .addRelation('user_donation_payment')
      .create()

    results.condition.andWhere(`"data"."reason" IN (:...reasons)`, {
      reasons: [
        DonationType.INTEGRATION_CART_BANNER,
        DonationType.INTEGRATION_CART_DRAWER,
        DonationType.INTEGRATION_SALES_PORTION,
      ],
    })

    results.condition.andWhere(
      `"user_donation_payment"."reference_id" = :id 
      AND "user_donation_payment"."reference_id" IN (
        WITH IntegrationSettings AS (
          SELECT sps.id 
          FROM re2_shopify_sale_portion_settings sps
          JOIN re2_shopify_integrations si ON si.id = sps.shopifyIntegrationId
          JOIN re2_integrations i ON i.id = si.integrationId
          WHERE i.userId = :userId

          UNION ALL

          SELECT cbs.id 
          FROM re2_shopify_cart_banner_settings cbs
          JOIN re2_shopify_integrations si ON si.id = cbs.shopifyIntegrationId
          JOIN re2_integrations i ON i.id = si.integrationId
          WHERE i.userId = :userId

          UNION ALL

          SELECT cds.id 
          FROM re2_shopify_cart_drawer_settings cds
          JOIN re2_shopify_integrations si ON si.id = cds.shopifyIntegrationId
          JOIN re2_integrations i ON i.id = si.integrationId
          WHERE i.userId = :userId
        )
        SELECT id FROM IntegrationSettings
      )`,
      {
        id,
        userId,
      },
    )

    if (query?.date_filter?.start && query?.date_filter?.end) {
      results.condition.andWhere(`"data"."created" BETWEEN :start AND :end`, {
        start: query?.date_filter?.start,
        end: query?.date_filter?.end,
      })
    } else if (query?.date_filter?.start) {
      results.condition.andWhere(`"data"."created" >= :start`, {
        start: query?.date_filter?.start,
      })
    } else if (query?.date_filter?.end) {
      results.condition.andWhere(`"data"."created" <= :end`, {
        end: query?.date_filter?.end,
      })
    }

    results.condition.select([
      'data.id id',
      'data.reason reason',
      'data.amount net_amount',
      '(data.amount - data.system_fees) gross_amount',
      'data.created created',
      'data.system_fees system_fees',
      'user.id user_id',
      'user.display_name user_display_name',
      'user.username user_username',
      'user.email user_email',
    ])

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        Id: item.id,
        Reason: item.reason,
        'Net Amount': item.net_amount,
        'Gross Amount': item.gross_amount,
        Created: item.created,
        'System Fees': item.system_fees,
        'User ID': item.user_id,
        'Display Name': item.user_display_name,
        Username: item.user_username,
        Email: item.user_email,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    results.condition.orderBy('"data"."created"', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
