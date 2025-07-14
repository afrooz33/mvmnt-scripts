import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { TopicType } from '@app/src/users/contact/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { CreateContactDto } from '@app/src/users/contact/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: CreateContactDto, userId: string): Promise<SuccessRO> {
  try {
    let receiver

    const user: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: Not(
              In([AccountStatus.DELETED, AccountStatus.DISABLED, AccountStatus.BLOCKED]),
            ),
          },
          select: ['id', 'email', 'username', 'display_name', 'zendesk_customer_id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    if (!user.zendesk_customer_id) {
      const zendeskUser = await this.zendeskClient.users.create({
        user: {
          name: user.display_name,
          email: user.email,
          verified: true,
        },
      })

      await this.userService.updateOne({
        id: user.id,
        zendesk_customer_id: zendeskUser?.result?.id,
      })
    }

    if (payload.receiver) {
      receiver = await this.userService.documentExists({
        condition: [
          {
            where: {
              id: payload.receiver,
              account_status: Not(
                In([AccountStatus.DELETED, AccountStatus.DISABLED, AccountStatus.BLOCKED]),
              ),
            },
            select: ['id', 'email', 'username', 'display_name', 'zendesk_customer_id'],
          },
        ],
        errorMessage: ErrorKey.USER_NOT_FOUND,
      })

      if (!receiver.zendesk_customer_id) {
        const zendeskReceiver = await this.zendeskClient.users.create({
          user: {
            name: user.display_name,
            email: user.email,
            verified: true,
          },
        })

        await this.userService.updateOne({
          id: receiver.id,
          zendesk_customer_id: zendeskReceiver?.result?.id,
        })
      }
    }

    if (!user.zendesk_customer_id) {
      const zendeskUser = await this.zendeskClient.users.create({
        user: {
          name: user.display_name,
          email: user.email,
          verified: true,
        },
      })

      await this.userService.updateOne({
        id: user.id,
        zendesk_customer_id: zendeskUser?.result?.id,
      })
    }

    let deal = null

    if (payload.deal) {
      deal = await this.dealService.documentExists({
        condition: [
          {
            where: {
              id: payload.deal,
              status: DealStatus.ON_DEAL,
            },
            select: ['id', 'name'],
          },
        ],
        errorMessage: ErrorKey.DEAL_NOT_FOUND,
      })
    }

    let body = payload.message

    if (
      payload.topic === TopicType.ABOUT_SHIPPING_REVIEW ||
      payload.topic === TopicType.ABOUT_PROBLEM
    ) {
      body = `${body} \nUser is ${payload.user_type}`
    }

    if (payload.topic === TopicType.REPORT_BUG) {
      body = `${body} \nDate-time of occurrence: ${payload.date_of_occurrence}\nFrequency: ${payload.frequency_of_occurrence}\nDetails: ${payload.issue_detail}\nIssue Message: ${payload.issue_message}`
    }

    if (payload.topic === TopicType.DELETE_ACCOUNT) {
      body = `${body} \nReason: ${payload.account_deleting_reason}\nReason details: ${payload.account_deleting_reason_detail}\nForfeit sales: ${payload.account_deleting_forfeit_sales}\nConfirmation: ${payload.account_deleting_confirmation}`
    }

    const customerEmail = payload.email ? payload.email : user.email

    let subject = `${payload.topic} - ${payload.sub_topic} - ${user.username}`

    if (payload.topic === TopicType.OTHER) {
      subject = `${payload.sub_topic} - ${user.username}`
    }

    const zendeskTicket: any = await this.zendeskClient.tickets.create({
      ticket: {
        comment: {
          body,
          uploads: payload.attachment,
        },
        priority: 'urgent',
        subject,
        external_id: userId,
        metadata: {
          user_id: userId,
          email: user.email,
          receiver: payload.receiver,
        },
        requester: {
          name: user.username,
          email: customerEmail,
        },
      },
    })

    const ticket = await this.contactRepository.save(
      await this.contactRepository.create({
        zendesk_ticket_id: zendeskTicket?.result?.id,
        user,
        deal,
        receiver,
        name: user.username,
        email: customerEmail,
      }),
    )

    return {
      data: ticket,
      message: 'Ticket created successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
