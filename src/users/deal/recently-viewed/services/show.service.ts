import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetTotalBidsQuery,
  GetDealQuantityQuery,
  GetDealFirstImageQuery,
  GetDonationAmountQuery,
  GetRaffleTotalPrizesQuery,
} from '@app/src/shared/sql'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/users/deal/recently-viewed/dto'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const sellerUsername = `(SELECT "users"."username" FROM "users" WHERE "users"."id" = "deal"."userId")`
    const sellerIsVerified = `(SELECT "users"."is_verified" FROM "users" WHERE "users"."id" = "deal"."userId")`
    const sellerAccountType = `(SELECT "users"."account_type" FROM "users" WHERE "users"."id" = "deal"."userId")`

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.recentlyViewedDealRepository)
      .addRelation(Query.DEAL)
      .addFilter('user', userId)
      .create()

    results.condition.andWhere(`"deal"."status" IN (:...deal_status)`, {
      deal_status: [DealStatus.ENDED, DealStatus.ON_DEAL, DealStatus.DELETE_REQUESTED],
    })

    results.condition.select([
      'data.id as view_id',
      'deal.id as id',
      'deal.name as name',
      'deal.status as status',
      'deal.end_date as end_date',
      'deal.deal_type as deal_type',
      'deal.start_date as start_date',
      'deal.donation_type as donation_type',
      'deal.item_condition as item_condition',
      'deal.donation_amount as donation_amount',
      `(CASE
          WHEN deal.deal_type = '${DealType.AUCTION}' THEN (SELECT
            COALESCE(MAX("bids"."bid_amount")::float, 0)
          FROM
            "user_deal_bids" "bids"
          WHERE "bids"."dealId" = "deal"."id")
        WHEN deal.deal_type = '${DealType.BUYNOW}' THEN (
          SELECT
            MIN("deal_variants"."price")
          FROM
            "deal_variants"
          WHERE
            "deal_variants"."dealId" = "deal"."id"
        )
        ELSE deal.starting_price END) AS "price"`,
      `${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')}`,
      `CASE
        WHEN deal.deal_type = '${DealType.AUCTION}' THEN (${GetTotalBidsQuery('"deal"')})
        ELSE '0' END AS "total_bids"`,
      `CASE
        WHEN deal.deal_type = '${DealType.RAFFLE}' THEN (${GetRaffleTotalPrizesQuery('"deal"')})
        ELSE '0' END AS "total_prizes"`,
      `${GetDealQuantityQuery('"deal"."id" = "deals"."id"')} AS "remaining_quantity"`,
      `${sellerUsername} as "seller_username"`,
      `${sellerAccountType} as "seller_account_type"`,
      `${sellerIsVerified} as "seller_is_verified"`,
      `(SELECT
        "images"."url" FROM "images" WHERE "images"."id" = (SELECT "user_profiles"."profileImagesId" FROM "user_profiles" WHERE "user_profiles"."userId" = "deal"."userId")) as "seller_profile_image"`,
      `${GetDonationAmountQuery('"deal"')} AS "donation"`,
      `(SELECT
        COUNT(*)::int FROM "deal_variants" WHERE "dealId" = "deal"."id") AS "variants_count"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
