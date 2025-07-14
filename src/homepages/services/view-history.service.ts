import { QueryDto } from '@app/src/homepages/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetTotalBidsQuery,
  GetCurrentBidQuery,
  GetDealQuantityQuery,
  GetDealFirstImageQuery,
} from '@app/src/shared/sql'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (
  _homepage: HomepagesEntity,
  query: QueryDto,
): Promise<QueryBuilderDataInterface> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('deal')
      .addRelation('deal.user')
      .addRelation('user.profile')
      .useQuery(this.recentlyViewedRepository)
      .create()

    results.condition.select([
      'data.id',
      'deal.id as "deal_id"',
      'deal.name',
      'deal.status',
      'deal.start_date',
      'deal.item_condition',
      'deal.starting_price',
      'deal.end_date',
      'user.username',
      'deal.deal_type',
      'deal.donation_type',
      'deal.donation_amount',
      'user.display_name',
      'user.account_type',
      'user.id "user_id"',
      `${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')}`,
      `(SELECT
        "images"."url"
      FROM
        "images"
      WHERE "images"."id" = "profile"."profileImagesId" LIMIT 1) as "user_profile_image"`,
      `(${GetCurrentBidQuery('data')}) as "current_bid"`,
      `(SELECT
        MIN("deal_variants"."price")
      FROM  "deal_variants"
        WHERE "deal_variants"."dealId" = "data"."id") as "lowest_price"`,
      `(${GetTotalBidsQuery('data')}) as "total_bids"`,
      `(SELECT
        COUNT("deal_raffle_prizes"."id")
        FROM
          "deal_raffle_prizes"
          LEFT JOIN "deal_raffles"
            ON "deal_raffles"."id" = "deal_raffle_prizes"."rafflesId"
            WHERE "deal_raffles"."dealId" = "data"."id") as "total_prizes"`,
      `${GetDealQuantityQuery('"deal"."id" = "deals"."id"')} AS "total_remaining_quantity"`,
      `(SELECT COUNT(*)::int FROM "deal_variants" WHERE "dealId" = "deal"."id") AS "variants_count"`,
    ])

    results.condition.andWhere('"deal"."status" IN (:...deal_status)', {
      deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    results.condition.andWhere('"user"."account_status" = :account_status', {
      account_status: AccountStatus.ENABLED,
    })

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
