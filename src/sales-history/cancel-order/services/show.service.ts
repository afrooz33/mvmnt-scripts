import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/sales-history/cancel-order/dto'

export default async function showService(query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.cancellationRepository)
      .addFilter('seller', userId)
      .addRelation('cart')
      .addRelation('bid')
      .addRelation('buyer')
      .addRelation('buyer.profile')
      .addRelation('profile.profile_images')
      .create()

    results.condition.select([
      '"data"."id"',
      '"data"."status"',
      '"data"."requested_at"',
      '"data"."seller_notes"',
      '"data"."approved_at"',
      '"data"."rejected_at"',
      '"data"."refunded_at"',
      '"data"."refund_id"',
      '"data"."refund_amount"',
      '"data"."refund_amount_in_token"',
      '"data"."token_symbol"',

      `CASE
        WHEN "data"."cartId" IS NOT NULL THEN "cart"."id"
        WHEN "data"."bidId" IS NOT NULL THEN "bid"."id"
        ELSE NULL
      END as order_id`,

      `CASE
        WHEN "data"."cartId" IS NOT NULL THEN "cart"."purchase_date"
        WHEN "data"."bidId" IS NOT NULL THEN "bid"."purchase_date"
        ELSE NULL
      END as purchase_date`,

      `CASE
        WHEN "data"."cartId" IS NOT NULL THEN "cart"."return_deadline"
        WHEN "data"."bidId" IS NOT NULL THEN "bid"."return_deadline"
        ELSE NULL
      END as cancellation_deadline`,

      `json_build_object(
          'id', "buyer"."id",
          'display_name', "buyer"."display_name",
          'username', "buyer"."username",
          'profile_image', "profile_images"."url",
          'verified', "buyer"."is_verified" 
       ) as buyer`,

      `(SELECT SUM(
          CASE
            WHEN item."cartItemId" IS NOT NULL THEN (
              SELECT ci.total / ci.quantity
              FROM user_deal_buynow_cart_items ci
              WHERE ci.id = item."cartItemId"
            ) * item.quantity_to_cancel
            WHEN "data"."bidId" IS NOT NULL THEN (
              SELECT b.bid_amount / b.quantity
              FROM user_deal_bids b
              WHERE b.id = "data"."bidId"
            ) * item.quantity_to_cancel
            ELSE 0
          END
        )
        FROM "order_cancellation_items" "item"
        WHERE item."cancellationId" = "data"."id"
      )::float AS cancellation_request_amount`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
