import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus } from '@app/src/users/deal/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function (
  query: MyPaginateDto,
  dealId: string,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDealItemPaymentRepository)
      .addRelation(Query.DEAL)
      .addFilter('deal', dealId)
      .addRelation(Query.SENDER)
      .create()

    results.condition.andWhere('"deal"."status" NOT IN (:...status)', {
      status: [DealStatus.DELETED, DealStatus.SCHEDULED],
    })

    results.condition.andWhere('"deal"."userId" = :userId', { userId })
    results.condition.andWhere('"data"."status" IN (:...payment_status)', {
      payment_status: [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED],
    })

    results.condition.select([
      'data.id as id',
      '"deal"."id" as deal_id',
      '"sender"."id" as user_id',
      'data.status as status',
      'data.quantity as quantity',
      'data.created as purchase_date',
      'data.deal_amount as deal_amount',
      '"sender"."username" as buyer_username',
      '"sender"."display_name" as buyer_display_name',
      'user_contact.id as user_contact_id',
      'user_contact.zendesk_ticket_id as zendesk_ticket_id',
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
              "user_profiles"."userId" = "sender"."id")) as "profile_image"`,
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
      '"user_contact"."userId" = "sender"."id" OR "user_contact"."receiverId" = "sender"."id"',
    )

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
