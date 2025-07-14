import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (query: MyPaginateDto, user: string): Promise<PaginateRO> {
  try {
    const reviewedDealsSubquery = `SELECT "dealId" FROM "user_deal_review" WHERE "userId" = :userId`

    const unionSubquery = `
      (
        SELECT DISTINCT "dealId" FROM "user_deal_bids" 
        WHERE "userId" = :userId AND "status" = :bid_status

        UNION

        SELECT DISTINCT "items"."dealId" 
        FROM "user_deal_buynow_cart_items" "items"
        JOIN "user_deal_buynow_cart" "cart" ON "items"."cartId" = "cart"."id"
        WHERE "cart"."userId" = :userId AND "cart"."status" IN (:...cart_status)
      )
    `

    // Start building the main query
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealService.dealRepository)
      .create()

    results.condition.andWhere('"data"."userId" != :userId', {
      userId: user,
    })

    // Filter for deals of type BUYNOW or RAFFLE
    results.condition.andWhere('"data"."deal_type" IN (:...deal_type)', {
      deal_type: [DealType.BUYNOW, DealType.RAFFLE],
    })

    // Filter for deals with status ON_DEAL or ENDED
    results.condition.andWhere('"data"."status" IN (:...deal_status)', {
      deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    // Apply the union subquery filter
    results.condition.andWhere(`"data"."id" IN ${unionSubquery}`, {
      userId: user,
      bid_status: BidStatus.COMPLETED,
      cart_status: [CartStatus.REVIEW_DEAL],
    })

    // Exclude deals that the user has already reviewed
    results.condition.andWhere(`"data"."id" NOT IN (${reviewedDealsSubquery})`, {
      userId: user,
    })

    // Select only the necessary fields
    results.condition.select([
      '"data"."id"',
      '"data"."name"',
      '"data"."deal_type"',
      '"data"."status"',
      `${GetDealFirstImageQuery('"data"."deal_type"', '"data"."id"')}`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
