import { GetDealImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function showReturnRequestService(id: string, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.orderReturnExchangeItemRepository)
      .addRelation('cart_item')
      .addRelation('return_exchange')
      .addRelation('return_exchange.buyer')
      .addRelation('return_exchange.logs')
      .addRelation('buyer.profile')
      .addRelation('profile.profile_images')
      .addRelation('shipments')
      .create()

    results.condition.andWhere(
      `"return_exchange"."sellerId" = :sellerId AND "return_exchange"."id" = :id`,
      {
        sellerId: userId,
        id,
      },
    )

    // Group by the primary key of the item table to ensure one result row per item
    results.condition.groupBy([
      '"data"."id"',
      '"return_exchange"."id"',
      '"buyer"."id"',
      '"profile"."id"',
      '"profile_images"."id"',
    ])

    results.condition.select([
      '"data"."id"',
      '"data"."quantity_requested"',
      '"data"."reason"',
      '"data"."notes"',
      '"data"."status"',
      '"data"."approved_quantity"',
      '"data"."shipped_quantity"',
      '"data"."approved_at"',
      '"data"."rejected_at"',
      '"data"."closed_at"',
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "return_exchange"."id",
          'type', "return_exchange"."type",
          'status', "return_exchange"."status",
          'requested_at', "return_exchange"."requested_at",
          'notes_to_seller', "return_exchange"."notes_to_seller",
          'message_to_requester', "return_exchange"."message_to_requester",
          'internal_notes', "return_exchange"."internal_notes",
          'logs', COALESCE(
            (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', "log"."id",
                  'action', "log"."action",
                  'timestamp', "log"."timestamp",
                  'details', "log"."details"
                )
                ORDER BY "log"."timestamp" ASC
              )
              FROM "order_return_exchange_logs" "log"
              WHERE "log"."returnExchangeId" = "return_exchange"."id"
            ),
            '[]'::json
          )
        )
      ) AS return_exchange`,
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
        WHERE "bid"."id" = "data"."bidId"
      ) AS bid`,
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "buyer"."id",
          'display_name', "buyer"."display_name",
          'username', "buyer"."username",
          'profile_image', COALESCE("profile_images"."url", NULL)
        )
      ) AS buyer`,
      `(
        SELECT COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', "shipment"."id",
            'tracking_number', "shipment"."tracking_number",
            'delivery_carrier_id', "dc"."id",
            'delivery_carrier', "dc"."name",
            'shipped_at', "shipment"."shipped_at"
          )
        ), '[]'::json)
        FROM "order_return_shipments" "shipment"
        LEFT JOIN "delivery_carrier" "dc" ON "dc"."id" = "shipment"."deliveryCarrierId"
        WHERE "shipment"."returnExchangeItemId" = "data"."id"
      ) AS shipments`,
    ])

    return await results.condition.getRawMany()
  } catch (error) {
    return HandleErrors(error)
  }
}
