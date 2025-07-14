import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealType } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/users/purchases/dto'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDealPaymentRepository)
      .addRelation('bid')
      .addRelation('cart')
      .addRelation('cart.wishlist')
      .addRelation('payment_currency')
      .create()

    results.condition.andWhere(`"data"."userId" = :userId`, { userId })

    results.condition.andWhere(`"data"."status" IN (:...payment_status)`, {
      payment_status: [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED],
    })

    results.condition.select([
      'data.id as id',
      'data.created as purchase_date',
      'data.deal_amount as amount',
      'data.deal_type as deal_type',
      'data.status as status',
      'data.cartId as cart_id',
      'data.bidId as bid_id',
      'data.rafflePurchaseId as raffle_purchase_id',
      `CASE
        WHEN "data"."deal_type" = '${DealType.BUYNOW}' THEN "cart"."return_deadline"
        WHEN "data"."deal_type" = '${DealType.AUCTION}' THEN "bid"."return_deadline"
        ELSE NULL
      END as return_deadline`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "payment_currency"."id",
            'name', "payment_currency"."name",
            'address', "payment_currency"."address",
            'logo_uri', "payment_currency"."logo_uri"
          )
      ) payment`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "seller"."id",
            'display_name', "seller"."display_name",
            'username', "seller"."username",
            'profile_image', "seller_image"."url"
          )
          FROM
            "user_deal_item_payment" "item_payment"
          JOIN "deals" "deal" ON "deal"."id" = "item_payment"."dealId"
          JOIN "users" "seller" ON "seller"."id" = "deal"."userId"
          JOIN "user_profiles" "seller_profile" ON "seller_profile"."userId" = "seller"."id"
          JOIN "images" "seller_image" ON "seller_image"."id" = "seller_profile"."profileImagesId"
          WHERE
            "item_payment"."paymentId" = "data"."id"
            AND "item_payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
          LIMIT 1
      ) seller`,
      `CASE WHEN "cart"."wishlistId" IS NOT NULL THEN (
        SELECT
          JSON_BUILD_OBJECT(
            'id', "wishlist"."id",
            'title', "wishlist"."title",
            'recipient', (
              SELECT
                JSON_BUILD_OBJECT(
                  'id', "user"."id",
                  'display_name', "user"."display_name",
                  'username', "user"."username",
                  'profile_image', "user_image"."url"
                )
              FROM
                "users" "user"
              JOIN "user_profiles" "user_profile" ON "user_profile"."userId" = "user"."id"
              JOIN "images" "user_image" ON "user_image"."id" = "user_profile"."profileImagesId"
              WHERE
                "user"."id" = "wishlist"."userId"
              LIMIT 1
            ),
            'sender', (
              SELECT
                CASE
                  WHEN "cart"."is_anonymous" = true THEN NULL
                  ELSE
                    JSON_BUILD_OBJECT(
                      'id', "user"."id",
                      'display_name', "user"."display_name",
                      'username', "user"."username",
                      'profile_image', "user_image"."url"
                    )
                END
              FROM
                "users" "user"
              JOIN "user_profiles" "user_profile" ON "user_profile"."userId" = "cart"."userId"
              JOIN "images" "user_image" ON "user_image"."id" = "user_profile"."profileImagesId"
              WHERE
                "user"."id" = "cart"."userId"
              LIMIT 1
            )
          )
      ) ELSE NULL END AS whishlist`,
    ])

    if (query?.order_id) {
      results.condition.andWhere(`"data"."id" = :order_id`, {
        order_id: query.order_id,
      })
    }

    if (query?.keyword) {
      results.condition.andWhere(
        `
        EXISTS (
          SELECT 1 FROM "user_deal_item_payment" "item_payment"
          JOIN "deals" "deal" ON "deal"."id" = "item_payment"."dealId"
          WHERE "item_payment"."paymentId" = "data"."id"
          AND LOWER("deal"."name") ILIKE LOWER(:keyword)
        )
      `,
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

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

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
