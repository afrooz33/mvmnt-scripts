import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: any): Promise<SuccessRO> {
  try {
    const zendeskTicket = await this.zendeskClient.tickets.show(payload.zendesk_ticket_id)

    if (!zendeskTicket) {
      throw new BadRequestException('Zendesk ticket not found')
    }

    const user: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            zendesk_customer_id: zendeskTicket.result.requester_id,
            account_status: Not(In([AccountStatus.DELETED, AccountStatus.DISABLED])),
          },
          select: ['id', 'email', 'username', 'display_name', 'zendesk_customer_id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: payload.customer_id },
      }),
    })

    const ticket = await this.contactRepository.findOne({
      where: {
        zendesk_ticket_id: payload.zendesk_ticket_id,
        user: {
          id: user.id,
        },
      },
    })

    const new_ticket = await this.contactRepository.save(
      await this.contactRepository.create({
        ...ticket,
        user: {
          id: user.id,
        },
        zendesk_ticket_id: payload.zendesk_ticket_id,
        latest_comment: payload.latest_comment.replace(/\n|\r|-/gm, ''),
        sender_read: true,
        receiver_read: true,
      }),
    )

    return {
      message: 'Webhook handled successfully',
      success: true,
      data: new_ticket,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
