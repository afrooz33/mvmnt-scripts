import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { BidderDto } from '@app/src/users/deal/bid/dto'
import { DealStatus } from '@app/src/users/deal/enums'

export default async function (
  query: BidderDto,
  dealId: string,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.bidRepository)
      .addRelation(Query.DEAL)
      .addRelation(Query.USER)
      .create()

    results.condition.andWhere('"deal"."id" = :dealId', { dealId })
    results.condition.andWhere('"deal"."userId" = :userId', { userId })
    results.condition.andWhere('"deal"."status" IN (:...dealStatus)', {
      dealStatus: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    results.condition.select([
      'data.id as id',
      'deal.id as deal_id',
      'user.id as user_id',
      'data.status as status',
      'data.quantity as quantity',
      'data.bid_amount as bid_amount',
      'data.created as bid_placed_date',
      'user.username as bidder_username',
      'data.total_amount as total_amount',
      'data.purchase_date as purchase_date',
      'user.display_name as bidder_display_name',
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

    if (query?.status) {
      results.condition.andWhere('"data"."status" IN (:...bidStatus)', {
        bidStatus: typeof query.status === 'string' ? [query.status] : query.status,
      })
    }

    results.condition.orderBy({
      'data.total_amount': 'DESC',
      'data.created': 'DESC',
    })

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
