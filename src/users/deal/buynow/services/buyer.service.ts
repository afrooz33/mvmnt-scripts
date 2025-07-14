import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (
  query: MyPaginateDto,
  dealId: string,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.buyNowCartItemRepository)
      .addRelation(Query.DEAL)
      .addRelation(Query.VARIANT)
      .addRelation(Query.CART)
      .addRelation(`${Query.CART}.${Query.USER}`)
      .create()

    results.condition.where('"deal"."id" = :dealId', { dealId })

    results.condition.andWhere('"deal"."status" IN (:...dealStatus)', {
      dealStatus: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    results.condition.andWhere('"deal"."userId" = :userId', { userId })
    results.condition.andWhere('"cart"."status" IN (:...cartStatus)', {
      cartStatus: [
        CartStatus.REVIEW_DEAL,
        CartStatus.COMPLETED,
        CartStatus.SHIPPED,
        CartStatus.WAITING_SHIPMENT,
      ],
    })

    results.condition.select([
      'cart.id as id',
      'deal.id as deal_id',
      'user.id as user_id',
      'cart.status as status',
      '(SELECT SUM("quantity") FROM "user_deal_buynow_cart_items" "item" WHERE "item"."cartId" = "data"."id") as quantity',
      'data.total as total_amount',
      'user.username as buyer_username',
      'cart.purchase_date as purchase_date',
      'user.display_name as buyer_display_name',
      'user_contact.id as user_contact_id',
      'user_contact.zendesk_ticket_id as zendesk_ticket_id',
      `(SELECT "rating" FROM "user_deal_review" "review" WHERE "review"."dealId" = "data"."dealId" AND "review"."userId" = "cart"."userId" LIMIT 1) as rating`,
      `(SELECT
        "images"."url"
        FROM
          "images"
        WHERE
          "images"."id" = (SELECT
              "user_profiles"."profileImagesId"
            FROM
              "user_profiles"
            WHERE
              "user_profiles"."userId" = "user"."id")) as "profile_image"`,
    ])

    results.condition.leftJoin(
      `(SELECT
        "id",
        "userId",
        "receiverId",
        "zendesk_ticket_id"
      FROM
        "user_contact"
      WHERE
        ("userId" = '${userId}' OR "receiverId" = '${userId}') AND "dealId" = '${dealId}')`,
      'user_contact',
      '"user_contact"."userId" = "user"."id" OR "user_contact"."receiverId" = "user"."id"',
    )

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
