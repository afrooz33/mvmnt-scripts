import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetTotalBidsQuery,
  GetCurrentBidQuery,
  GetDealQuantityQuery,
  GetDealFirstImageQuery,
  GetTotalDealSalesQuery,
} from '@app/src/shared/sql'
import { QueryDto } from '@app/src/users/deal/dto'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function showService(query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealRepository)
      .addFilter('user', userId)
      .create()

    if (!query?.filter?.status) {
      results.condition.andWhere('"data"."status" NOT IN (:...status)', {
        status: [DealStatus.DELETED],
      })
    }

    results.condition.select([
      'data.id id',
      'data.name name',
      'data.deal_type deal_type',
      'data.start_date start_date',
      'data.end_date end_date',
      'data.is_one_of_kind is_one_of_kind',
      'data.status status',
      'data.purchase_availability',
      'data.deal_availability',
      'data.deal_access_date',
      'data.created created',
      `(${GetCurrentBidQuery('"data"')}) AS "current_bid"`,
      `(${GetTotalBidsQuery('"data"')}) AS "total_bids"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
        dealType: DealType.RAFFLE,
      })}) AS "total_raffle_sold"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
        dealType: DealType.RAFFLE,
        select: 'COALESCE(COUNT(DISTINCT "payment"."userId")::int, 0)',
      })}) AS "total_raffle_buyers"`,
      `${GetDealQuantityQuery('"data"."id" = "deals"."id"')} AS "remaining_quantity"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
        dealType: DealType.BUYNOW,
        select: 'COALESCE(COUNT(DISTINCT "payment"."userId")::int, 0)',
      })}) AS "buynow_participants"`,
      `${GetDealFirstImageQuery('"data"."deal_type"', '"data"."id"')}`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
