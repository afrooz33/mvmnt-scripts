import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetTotalBidsQuery,
  GetCurrentBidQuery,
  GetDealQuantityQuery,
  GetDonationAmountQuery,
  GetDealFirstImageQuery,
} from '@app/src/shared/sql'
import { QueryDto } from '@app/src/homepages/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { ContentSelection } from '@app/src/admin/homepages/enums'
import autoDealMethod from '@app/src/homepages/methods/autoDeal.method'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (
  homepage: HomepagesEntity,
  query: QueryDto,
): Promise<QueryBuilderDataInterface> {
  try {
    if (homepage.selection === ContentSelection.AUTO) {
      const results: QueryBuilderDataInterface = new QueryBuilder(query)
        .addRelation('user')
        .addRelation('user.profile')
        .useQuery(this.dealRepository)
        .create()

      return await autoDealMethod(homepage, results)
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('homepage', homepage.id)
      .addRelation(Query.DEAL)
      .addRelation(`${Query.DEAL}.${Query.USER}`)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .useQuery(this.homepageContentRepository)
      .create()

    results.condition.select([
      'data.id "id"',
      `deal.id "deal_id"`,
      `deal.name "deal_name"`,
      `deal.status "deal_status"`,
      `deal.start_date "deal_start_date"`,
      `deal.item_condition "deal_item_condition"`,
      `deal.starting_price "deal_starting_price"`,
      `deal.end_date "deal_end_date"`,
      'user.id "user_id"',
      'user.username "user_username"',
      `deal.deal_type "deal_deal_type"`,
      `deal.donation_type "deal_donation_type"`,
      `deal.donation_amount "deal_donation_amount"`,
      'user.display_name "user_display_name"',
      'user.account_type "user_account_type"',
      `${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')}`,
      `(SELECT
        "images"."url"
      FROM
        "images"
      WHERE "images"."id" = "profile"."profileImagesId" LIMIT 1) as "user_profile_image"`,
      `(${GetCurrentBidQuery(`deal`)}) as "current_bid"`,
      `(SELECT
        MIN("deal_variants"."price")
      FROM  "deal_variants"
        WHERE "deal_variants"."dealId" = "deal"."id") as "lowest_price"`,
      `(${GetTotalBidsQuery(`deal`)}) as "total_bids"`,
      `(SELECT
        COUNT("deal_raffle_prizes"."id")
        FROM
          "deal_raffle_prizes"
          LEFT JOIN "deal_raffles"
            ON "deal_raffles"."id" = "deal_raffle_prizes"."rafflesId"
            WHERE "deal_raffles"."dealId" = "deal"."id") as "total_prizes"`,
      `${GetDealQuantityQuery('"deal"."id" = "deals"."id"')} AS "total_remaining_quantity"`,
      `${GetDonationAmountQuery(`deal`)} as "final_donation_amount"`,
      `(SELECT COUNT(*)::int FROM "deal_variants" WHERE "dealId" = "deal"."id") AS "variants_count"`,
    ])

    results.condition.andWhere('"deal"."status" IN (:...deal_status)', {
      deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
