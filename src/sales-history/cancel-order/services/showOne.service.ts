import { GetDealImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function showReturnRequestService(id: string, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.cancellationItemRepository)
      .addRelation('cart_item')
      .addRelation('cancellation')
      .addRelation('cancellation.buyer')
      .addRelation('cancellation.logs')
      .addRelation('buyer.profile')
      .addRelation('profile.profile_images')
      .create()

    results.condition.andWhere(
      `"cancellation"."sellerId" = :sellerId AND "cancellation"."id" = :id`,
      {
        sellerId: userId,
        id,
      },
    )

    results.condition.select([
      '"data"."id"',
      '"data"."quantity_to_cancel"',
      '"data"."reason"',
      '"data"."status"',
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "cancellation"."id",
          'status', "cancellation"."status",
          'requested_at', "cancellation"."requested_at",
          'seller_notes', "cancellation"."seller_notes",
          'logs', COALESCE(
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', "log"."id",
                  'action', "log"."action",
                  'created', "log"."created",
                  'details', "log"."details"
                )
                ORDER BY "log"."created" ASC
              )
              FROM "order_cancellation_logs" "log"
              WHERE "log"."cancellationId" = "cancellation"."id"
            ),
            '[]'::json
          )
        )
      ) AS cancellation`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "dv"."id",
            'price', "dv"."price",
            'original_price', "dv"."original_price",
            'return_eligibility', "dv"."return_eligibility",
            'deal_id', "d"."id",
            'deal_name', "d"."name",
            'seller_id', "d"."userId",
            'option_values', (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', "dov"."id",
                'value', "dov"."value",
                'label_name', "dov"."label_name",
                'option', JSON_BUILD_OBJECT(
                  'id', "do"."id",
                  'type', "do"."type"
                )
              )), '[]')
              FROM "deal_option_values" "dov"
              JOIN "deal_variants_option_values_deal_option_values" "dvov" ON "dvov"."dealOptionValuesId" = "dov"."id"
              LEFT JOIN "deal_options" "do" ON "do"."id" = "dov"."optionId"
              WHERE "dvov"."dealVariantsId" = "dv"."id"
            ),
            'images', (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
              FROM "deal_variants_images_images" "dvii"
              LEFT JOIN "images" "i" ON "i"."id" = "dvii"."imagesId"
              WHERE "dvii"."dealVariantsId" = "dv"."id"
            )
          )
        FROM "user_deal_buynow_cart_items" "uci"
        LEFT JOIN "deal_variants" "dv" ON "dv"."id" = "uci"."variantId"
        LEFT JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "uci"."id" = "data"."cartItemId"
      ) AS "variant"`,
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "bid"."id",
          'bid_amount', "bid"."bid_amount",
          'quantity', "bid"."quantity",
          'deal', JSON_BUILD_OBJECT(
            'id', "d"."id",
            'name', "d"."name",
            'image', ${GetDealImageQuery('"d"."id"')}
          )
        )
        FROM "user_deal_bids" "bid"
        JOIN "deals" "d" ON "d"."id" = "bid"."dealId"
        WHERE "bid"."id" = "cancellation"."bidId"
      ) AS bid`,
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "buyer"."id",
          'display_name', "buyer"."display_name",
          'username', "buyer"."username",
          'profile_image', COALESCE("profile_images"."url", NULL)
        )
      ) AS buyer`,
    ])

    return await results.condition.getRawMany()
  } catch (error) {
    return HandleErrors(error)
  }
}
