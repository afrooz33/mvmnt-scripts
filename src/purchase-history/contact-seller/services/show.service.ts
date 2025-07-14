import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealType } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/purchase-history/contact-seller/dto'

export default async function (query: QueryDto, buyerId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.requestRepository)
      .addFilter('buyer', buyerId)
      .addRelation('seller')
      .addRelation('order')
      .addRelation('order.cart')
      .addRelation('order.bid')
      .addRelation('cart.items')
      .addRelation('items.deal')
      .addRelation('bid.deal')
      .create()

    if (query.status) {
      results.condition.andWhere('data.status = :status', { status: query.status })
    }

    if (query.order) {
      results.condition.andWhere('order.id = :orderId', { orderId: query.order })
    }

    if (query.keyword && query.search_fields) {
      results.condition.andWhere(
        `LOWER(JSON_UNQUOTE(JSON_EXTRACT(data, '$.${query.search_fields}'))) LIKE :keyword`,
        { keyword: `%${query.keyword.toLowerCase()}%` },
      )
    }

    results.condition.select([
      '"data"."id"',
      '"data"."status"',
      '"data"."created"',
      '"data"."updated"',
      `JSON_BUILD_OBJECT(
          'id', "seller"."id",
          'display_name', "seller"."display_name",
          'username', "seller"."username",
          'profile_image', (SELECT img.url FROM images img JOIN user_profiles up ON up."profileImagesId" = img.id WHERE up."userId" = seller.id LIMIT 1)
       ) as seller_info`,
      `JSON_BUILD_OBJECT(
          'id', "order"."id",
          'created', "order"."created",
          'order_type', CASE
              WHEN "order"."cartId" IS NOT NULL THEN '${DealType.BUYNOW}'
              WHEN "order"."bidId" IS NOT NULL THEN '${DealType.AUCTION}'
              ELSE 'UNKNOWN'
            END,
          'deal_name', COALESCE(
            (SELECT d.name FROM deals d JOIN user_deal_buynow_cart_items ci ON ci."dealId" = d.id WHERE ci."cartId" = "order"."cartId" ORDER BY ci.created LIMIT 1),
            (SELECT d.name FROM deals d WHERE d.id = "deal_1"."id" LIMIT 1)
            )
          ) as order_summary`,
      `(SELECT "msg"."message" FROM "contact_seller_messages" "msg" WHERE "msg"."requestId" = "data"."id" ORDER BY "msg"."sent_at" DESC LIMIT 1) as last_message`,
      `(SELECT "msg"."sent_at" FROM "contact_seller_messages" "msg" WHERE "msg"."requestId" = "data"."id" ORDER BY "msg"."sent_at" DESC LIMIT 1) as last_message_at`,
    ])

    results.condition.orderBy('"data"."updated"', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
