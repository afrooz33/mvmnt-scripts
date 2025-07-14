import { Query } from '@app/src/shared/enums'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'

export default async function (id: string, userId: string, zendesk_ticket_id: string) {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.contactRepository)
      .addRelation(Query.DEAL)
      .addRelation(Query.RECEIVER)
      .addRelation(`${Query.RECEIVER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .addFilter('id', id)
      .addFilter('zendesk_ticket_id', zendesk_ticket_id)
      .addFilter('user', userId)
      .create()

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

    const ticket = await results.condition.getRawOne()

    const zendeskTicket = await this.zendeskClient.tickets.getComments(zendesk_ticket_id)

    return {
      ticket,
      zendeskTicket,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
