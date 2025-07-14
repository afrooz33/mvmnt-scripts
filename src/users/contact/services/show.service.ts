import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/contact/dto'
import { MessageType } from '@app/src/users/contact/enums'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.contactRepository)
      .addRelation(Query.DEAL)
      .addRelation(Query.RECEIVER)
      .addRelation(`${Query.RECEIVER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere(`("data"."userId" = :userId OR "data"."receiverId" = :userId)`, {
      userId,
    })

    results.condition.select([
      'data.id as id',
      'deal.id as deal_id',
      'deal.name as deal_name',
      'data.sender_read as sender_read',
      'data.receiver_read as receiver_read',
      'deal.deal_type as deal_type',
      'data.latest_comment as latest_comment',
      'data.zendesk_ticket_id as zendesk_ticket_id',
      'data.updated as last_sent',
      'receiver.id as receiver_id',
      'receiver.username as receiver_username',
      'receiver.account_type as receiver_account_type',
      'receiver.display_name as receiver_display_name',
      'profile.identity_verification_status as receiver_verification_status',
      'profile_images.url as receiver_profile_image',
      `CASE WHEN "data"."receiverId" IS NOT NULL THEN 'DEAL' ELSE 'ADMIN' END as "message_type"`,
      `${GetDealFirstImageQuery(`"deal"."deal_type"`, `"deal"."id"`)}`,
    ])

    if (query?.keyword) {
      results.condition.andWhere(`"deal"."name" ILIKE :keyword`, {
        keyword: `%${query.keyword}%`,
      })
    }

    if (query?.deal_type) {
      results.condition.andWhere(`"deal"."deal_type" = :deal_type`, {
        deal_type: query.deal_type,
      })
    }

    if (query?.message_type === MessageType.DEAL) {
      results.condition.andWhere(`"data"."dealId" IS NOT NULL`)
    } else if (query?.message_type === MessageType.ADMIN) {
      results.condition.andWhere(`"data"."dealId" IS NULL`)
    }

    if (query?.last_sent?.leading_date) {
      results.condition.andWhere(`"data"."updated" >= :leading_date`, {
        leading_date: query.last_sent.leading_date,
      })
    }

    if (query?.last_sent?.trailing_date) {
      results.condition.andWhere(`"data"."updated" <= :trailing_date`, {
        trailing_date: query.last_sent.trailing_date,
      })
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
