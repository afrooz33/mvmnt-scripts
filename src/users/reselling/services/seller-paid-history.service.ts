import { DateTime } from 'luxon'
import { Query } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { POINTS_STATUS } from '@app/src/users/points/enums'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'

export default async function (query: MyPaginateDto, userId: string): Promise<unknown> {
  try {
    const currentDate = DateTime.local()
    const startDate = currentDate.minus({ months: 11 }).startOf('month')

    const dateRanges = [
      { month: 'Jan', startDate: '12/16', endDate: '01/15' },
      { month: 'Feb', startDate: '01/15', endDate: '02/13' },
      { month: 'Mar', startDate: '02/14', endDate: '03/15' },
      { month: 'Apr', startDate: '03/16', endDate: '04/14' },
      { month: 'May', startDate: '04/15', endDate: '05/15' },
      { month: 'Jun', startDate: '05/16', endDate: '06/14' },
      { month: 'Jul', startDate: '06/15', endDate: '07/15' },
      { month: 'Aug', startDate: '07/16', endDate: '08/15' },
      { month: 'Sep', startDate: '08/16', endDate: '09/14' },
      { month: 'Oct', startDate: '09/15', endDate: '10/15' },
      { month: 'Nov', startDate: '10/16', endDate: '11/14' },
      { month: 'Dec', startDate: '11/15', endDate: '12/15' },
    ]

    const queryBuilder: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.resellingRewardRepository)
      .addRelation(Query.POINTS)
      .create()

    queryBuilder.condition
      .select([
        `'Paid ' || to_char(date_trunc('month', "points"."delivery_date"), 'Mon YYYY') AS payment_month`,
        `to_char(date_trunc('month', "points"."delivery_date"), 'MM') AS month`,
        `to_char(date_trunc('month', "points"."delivery_date"), 'YYYY') AS year`,
        `CASE 
          ${dateRanges
            .map(
              (range) => `
            WHEN to_char(date_trunc('month', "points"."delivery_date"), 'Mon') = '${range.month}' 
            THEN '${range.startDate} ~ ${range.endDate}'
          `,
            )
            .join('\n')}
         END AS order_date_range`,
        'COALESCE(SUM("points"."amount"), 0) AS amount',
      ])
      .innerJoin(BuynowCartEntity, 'cart', '"data"."cartId" = cart.id')
      .where('"points"."status" IN (:...statuses)', {
        statuses: [
          POINTS_STATUS.EXPIRED,
          POINTS_STATUS.REDEEMED,
          POINTS_STATUS.DELIVERED,
          POINTS_STATUS.PARTIALLY_REDEEMED,
        ],
      })
      .andWhere('"points"."delivery_date" >= :startDate', {
        startDate: startDate.toJSDate(),
      })
      .andWhere('"points"."delivery_date" <= :endDate', {
        endDate: currentDate.toJSDate(),
      })
      .andWhere('"cart"."sellerId" = :userId', { userId })
      .groupBy(`date_trunc('month', "points"."delivery_date")`)
      .orderBy(`date_trunc('month', "points"."delivery_date")`, 'DESC')

    let finalResults = []
    const results = await this.rawPaginate(queryBuilder)

    if (results.data.length) {
      const formattedResults = results.data.map((row) => ({
        month_year: `${row.payment_month} (for orders ${row.order_date_range})`,
        points: `${row.amount} points`,
        month: row.month,
        year: row.year,
      }))

      const limit = Number.parseInt(query.limit, 10) || 10

      const allPossibleResults = []

      for (let i = 0; i < 12; i++) {
        const date = currentDate.minus({ months: i })
        const month = date.toFormat('MM')
        const monthName = date.toFormat('MMM')
        const year = date.toFormat('yyyy')
        const dateRange = dateRanges.find((dr) => dr.month === monthName)

        if (dateRange) {
          allPossibleResults.push({
            month_year: `Paid ${monthName} ${year} (for orders ${dateRange.startDate} ~ ${dateRange.endDate})`,
            points: '0 points',
            month,
            year,
          })
        }
      }

      const mergedResults = allPossibleResults.map((possibleResult) => {
        const actualResult = formattedResults.find(
          (r) =>
            r.month_year.split('(')[0].trim() === possibleResult.month_year.split('(')[0].trim(),
        )
        return actualResult || possibleResult
      })

      finalResults = mergedResults.slice(0, limit)
    }

    return {
      ...results,
      data: finalResults,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
