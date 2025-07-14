import { ExportToCsv } from 'export-to-csv'
import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GenerateDateRangeFilter, GetDealStatsQuery } from '@app/src/shared/sql/common.sql'
import { DealStatus } from '@app/src/users/deal/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'

export default async function (query: DateFilterQueryDto, isExport = false): Promise<PaginateRO> {
  try {
    const total_donation_query = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'donations',
      condition: ' AND ',
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation(Query.PROFILE)
      .addRelation(Query.PROFILE_IMAGES)
      .useQuery(this.userRepository)
      .create()

    results.condition.select([
      'data.id as id',
      'data.username as username',
      'data.display_name as display_name',
      'profile_images.url as profile_image',
      'data.account_type as account_type',
      'data.rank as rank',
      'profile.social_accounts as social_accounts',
      'COALESCE(deal_stats.total_deals_sold, 0) AS total_deals_sold',
      'COALESCE(deal_stats.total_donations, 0) AS total_donations',
      'COALESCE(deal_stats.total_net_donations, 0) AS total_net_donations',
      'COALESCE(deal_stats.highest_selling_amount, 0) AS highest_selling_amount',
    ])

    results.condition.leftJoin(
      `(${GetDealStatsQuery({
        select: `
          "deals"."userId",
          COUNT(DISTINCT "deals"."id") AS "total_deals_sold",
          COALESCE(SUM("donations"."amount" + "donations"."system_fees"), 0) AS "total_donations",
          COALESCE(SUM("donations"."amount" - "donations"."system_fees"), 0) AS "total_net_donations",
          COALESCE(SUM("payment"."deal_amount"), 0) AS "highest_selling_amount"
        `,
        columnMatchCondition: total_donation_query,
        additionalWhere: `
          AND "donations"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        `,
      })})`,
      'deal_stats',
      `"data"."id" = "deal_stats"."userId"`,
    )

    results.condition.andWhere(
      'data.id IN (SELECT DISTINCT "userId" FROM "deals" WHERE "status" NOT IN (:...status))',
      { status: [DealStatus.DRAFT, DealStatus.DELETED, DealStatus.SCHEDULED] },
    )

    results.condition.andWhere(`"highest_selling_amount" > 0 OR "total_deals_sold" > 0`)

    results.condition.orderBy('highest_selling_amount', 'DESC')

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData = data.map((item: any) => ({
        Id: item.id,
        Name: item.display_name,
        Username: item.username,
        'Account type': item.account_type,
        'Total deal sold': item.total_deals_sold,
        'Total donation': item.total_donations,
        'Total net donation': item.total_net_donations,
        'Total sell': item.highest_selling_amount,
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
