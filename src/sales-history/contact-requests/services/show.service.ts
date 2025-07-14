import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealType } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/sales-history/contact-requests/dto'

export default async function (sellerId: string, query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.requestRepository)
      .addFilter('seller', sellerId)
      .addRelation('buyer')
      .addRelation('order')
      .create()

    if (query?.status) {
      results.condition.andWhere('"data"."status" = :status', {
        status: query.status,
      })
    }

    if (query?.buyer) {
      results.condition.andWhere('"buyer"."id" = :buyerId', {
        buyerId: query.buyer,
      })
    }

    if (query?.order) {
      results.condition.andWhere('"order"."id" = :orderId', {
        orderId: query.order,
      })
    }

    results.condition.select([
      '"data"."id"',
      '"data"."status"',
      '"data"."created"',
      '"data"."updated"',
      `JSON_BUILD_OBJECT(
          'id', "buyer"."id",
          'display_name', "buyer"."display_name",
          'username', "buyer"."username",
          'profile_image', (SELECT img.url FROM images img JOIN user_profiles up ON up."profileImagesId" = img.id WHERE up."userId" = buyer.id LIMIT 1)
       ) as buyer_info`,
      `JSON_BUILD_OBJECT(
          'id', "order"."id",
          'created', "order"."created",
          'order_type', CASE
              WHEN "order"."cartId" IS NOT NULL THEN '${DealType.BUYNOW}'
              WHEN "order"."bidId" IS NOT NULL THEN '${DealType.AUCTION}'
              ELSE 'UNKNOWN'
            END
          -- Add deal_name if needed by joining through order->cart/bid->items->deal
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
