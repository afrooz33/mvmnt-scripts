import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealType } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/sales-history/dto'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { ShippingStatus } from '@app/src/sales-history/shipping/enums'

export default async function showService(query: QueryDto, sellerId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDealPaymentRepository)
      .addRelation('user')
      .addRelation('payment_currency')
      .addRelation('cart')
      .addRelation('cart.wishlist')
      .addRelation('bid')
      .create()

    results.condition.andWhere(
      `EXISTS (
        SELECT 1 FROM "user_deal_item_payment" "item"
        JOIN "deals" "deal" ON "deal"."id" = "item"."dealId"
        WHERE "item"."paymentId" = "data"."id"
        AND "deal"."userId" = :sellerId
      )`,
      { sellerId },
    )

    results.condition.andWhere(`"data"."status" IN (:...payment_status)`, {
      payment_status: [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED],
    })

    results.condition.select([
      'data.id as id',
      'data.created as purchase_date',
      'data.deal_type as deal_type',
      `JSON_BUILD_OBJECT(
        'id', payment_currency.id,
        'name', payment_currency.name,
        'logo_uri', payment_currency.logo_uri,
        'address', payment_currency.address
      ) payment`,
      `(
        SELECT
          CAST(SUM("ip"."deal_amount") AS text)
        FROM "user_deal_item_payment" "ip"
        WHERE "ip"."paymentId" = "data"."id"
      ) as total_amount_paid`,
      `CASE
        WHEN "data"."deal_type" = '${DealType.BUYNOW}' THEN "cart"."return_deadline"
        WHEN "data"."deal_type" = '${DealType.AUCTION}' THEN "bid"."return_deadline"
        ELSE NULL
      END as return_deadline`,
      `(
        SELECT JSON_BUILD_OBJECT(
            'id', "buyer"."id",
            'display_name', "buyer"."display_name",
            'username', "buyer"."username",
            'profile_image', (SELECT "url" FROM "images" WHERE "id" = "bp"."profileImagesId" LIMIT 1)
          )
        FROM "users" "buyer"
        LEFT JOIN "user_profiles" "bp" ON "bp"."userId" = "buyer"."id"
        WHERE "buyer"."id" = "data"."userId" -- Corrected to data.userId which is the buyer
        LIMIT 1
      ) buyer`,
      `CASE WHEN "cart"."wishlistId" IS NOT NULL THEN (
         SELECT JSON_BUILD_OBJECT('recipient_name', "wu"."display_name")
         FROM "wishlists" "w"
         JOIN "users" "wu" ON "w"."userId" = "wu"."id"
         WHERE "w"."id" = "cart"."wishlistId" LIMIT 1
      ) ELSE NULL END AS wishlist_info`,
      `( SELECT "cancellation"."status"
        FROM "order_cancellations" "cancellation"
        WHERE ("cancellation"."cartId" = "cart"."id" OR "cancellation"."bidId" = "bid"."id")
        ORDER BY "cancellation"."created" DESC LIMIT 1
      ) as cancellation_status`,
      `( SELECT json_build_object('status', "re"."status", 'type', "re"."type")
        FROM "order_return_exchange" "re"
        WHERE ("re"."cartId" = "cart"."id" OR "re"."bidId" = "bid"."id")
        ORDER BY "re"."created" DESC LIMIT 1
      ) as return_exchange_info`,
      `( SELECT
          CASE
            WHEN EXISTS (SELECT 1 FROM "order_shippings" s WHERE (s."cartId" = "data"."cartId" OR s."bidId" = "data"."bidId") AND s.status = '${ShippingStatus.DELIVERED}') THEN '${ShippingStatus.DELIVERED}'
            WHEN EXISTS (SELECT 1 FROM "order_shippings" s WHERE (s."cartId" = "data"."cartId" OR s."bidId" = "data"."bidId") AND s.status IN ('${ShippingStatus.SHIPPED}', '${ShippingStatus.PARTIALLY_SHIPPED}')) THEN '${ShippingStatus.SHIPPED}'
            ELSE '${ShippingStatus.PENDING}'
          END
      ) as overall_shipping_status`,
    ])

    if (query?.status) {
      results.condition.andWhere(`"data"."status" = :status`, {
        status: query.status,
      })
    }

    if (query?.purchase_date) {
      if (query?.purchase_date?.leading_date && query?.purchase_date?.trailing_date) {
        results.condition.andWhere(
          `DATE("data"."created") BETWEEN :leading_date AND :trailing_date`,
          {
            leading_date: query.purchase_date.leading_date,
            trailing_date: query.purchase_date.trailing_date,
          },
        )
      } else if (query?.purchase_date?.leading_date) {
        results.condition.andWhere(`DATE("data"."created") >= :leading_date`, {
          leading_date: query.purchase_date.leading_date,
        })
      } else if (query?.purchase_date?.trailing_date) {
        results.condition.andWhere(`DATE("data"."created") <= :trailing_date`, {
          trailing_date: query.purchase_date.trailing_date,
        })
      }
    }

    results.condition.orderBy('"data"."created"', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
