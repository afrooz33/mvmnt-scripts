import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { Re2ContributorQueryDto } from '@app/src/re2/analytics/dto'
import { ContributorSourceFilter } from '@app/src/re2/analytics/enums'

export default async function (
  id: string,
  query: Re2ContributorQueryDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user')
      .addRelation('user_donation_payment')
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    let referenceCondition = ''

    if (query?.source_filter === ContributorSourceFilter.FORM) {
      referenceCondition = `SELECT "id" FROM "re2_fundraisers" WHERE "userId" = :userId AND "type" = '${FundraiserType.FORM}'`
    } else if (query?.source_filter === ContributorSourceFilter.PAGE) {
      referenceCondition = `SELECT "id" FROM "re2_fundraisers" WHERE "userId" = :userId AND "type" = '${FundraiserType.PAGE}'`
    } else if (query?.source_filter === ContributorSourceFilter.CART_BANNER) {
      referenceCondition = `SELECT cbs.id 
        FROM re2_shopify_cart_banner_settings cbs
        JOIN re2_shopify_integrations si ON si.id = cbs."shopifyIntegrationId"
        JOIN re2_integrations i ON i.id = si."integrationId"
        WHERE i."userId" = :userId`
    } else if (query?.source_filter === ContributorSourceFilter.CART_DRAWER) {
      referenceCondition = `SELECT cds.id 
        FROM re2_shopify_cart_drawer_settings cds
        JOIN re2_shopify_integrations si ON si.id = cds."shopifyIntegrationId"
        JOIN re2_integrations i ON i.id = si."integrationId"
        WHERE i."userId" = :userId`
    } else if (query?.source_filter === ContributorSourceFilter.SALES_PORTION) {
      referenceCondition = `SELECT sps.id 
        FROM re2_shopify_sale_portion_settings sps
        JOIN re2_shopify_integrations si ON si.id = sps."shopifyIntegrationId"
        JOIN re2_integrations i ON i.id = si."integrationId"
        WHERE i."userId" = :userId`
    }

    results.condition.andWhere(
      `"user_donation_payment"."reference_id" = :id AND "user_donation_payment"."reference_id" IN (
        ${referenceCondition}
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

    if (query?.keyword) {
      results.condition.andWhere(
        `("user"."display_name" ILIKE :keyword OR "user"."username" ILIKE :keyword OR "user"."email" ILIKE :keyword)`,
        {
          keyword: `%${query?.keyword}%`,
        },
      )
    }

    if (query?.gross_donation?.start && query?.gross_donation?.end) {
      results.condition.andWhere(
        `("data"."amount" - "data"."system_fees") BETWEEN :start AND :end`,
        {
          start: query?.gross_donation?.start,
          end: query?.gross_donation?.end,
        },
      )
    } else if (query?.gross_donation?.start) {
      results.condition.andWhere(`("data"."amount" - "data"."system_fees") >= :start`, {
        start: query?.gross_donation?.start,
      })
    } else if (query?.gross_donation?.end) {
      results.condition.andWhere(`("data"."amount" - "data"."system_fees") <= :end`, {
        end: query?.gross_donation?.end,
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
      'user.account_type user_account_type',
      'user.account_status user_account_status',
      'user.is_verified user_is_verified',
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
