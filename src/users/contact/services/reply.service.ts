import { In, Not } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { ReplyDto } from '@app/src/users/contact/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (
  payload: ReplyDto,
  userId: string,
  zendesk_ticket_id: string,
): Promise<SuccessRO> {
  try {
    const user: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: Not(In([AccountStatus.DELETED, AccountStatus.DISABLED])),
          },
          select: ['id', 'email', 'username', 'display_name', 'zendesk_customer_id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: userId },
      }),
    })

    const tickets = await this.contactRepository.query(
      `SELECT
        *
      FROM
        "user_contact"
      WHERE
        zendesk_ticket_id = '${zendesk_ticket_id}'
          AND ("userId" = '${userId}' OR "receiverId" = '${userId}');`,
    )

    if (!tickets.length) {
      throw new NotFoundException(ErrorKey.INVALID_CONTACT_US)
    }

    const ticket = tickets[0]

    await this.zendeskClient.tickets.update(ticket.zendesk_ticket_id, {
      ticket: {
        comment: {
          body: payload.message,
          uploads: payload.attachment,
          author_id: user.zendesk_customer_id,
          requester_id: process.env.ZENDESK_AGENT_ID,
          via: {
            channel: 'api',
            source: {
              to: {
                address: process.env.ZENDESK_EMAIL,
              },
            },
          },
        },
      },
    })

    ticket.latest_comment = payload.message
    ticket.sender_read = ticket.userId === userId ? true : false
    ticket.receiver_read = ticket.receiverId === userId ? true : false

    await this.contactRepository.save(ticket)

    return {
      data: ticket,
      message: 'Ticket replied successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
