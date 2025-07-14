import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BlockedDto } from '@app/src/admin/users/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (payload: BlockedDto): Promise<SuccessRO> {
  try {
    const block = await this.updateOne({
      ...payload,
      blocked_details: {
        ...payload.blocked_details,
        block_date: new Date(),
      },
      account_status: AccountStatus.BLOCKED,
    })

    await this.notificationsService.create({
      title: 'Your account has been blocked',
      user: block.id,
      type: NotificationType.ACCOUNT_BLOCKED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.SERVICE,
      data: {
        message: `Block period: ${payload.blocked_details.days} days`,
      },
    })

    const recurringDonations =
      await this.recurringDonationsService.recurringDonationSettingsRepository.find({
        where: {
          is_active: true,
          deal: {
            user: {
              id: block.id,
            },
          },
        },
        relations: {
          deal: true,
          user: true,
        },
        select: {
          id: true,
          deal: {
            id: true,
            name: true,
          },
          user: {
            id: true,
            display_name: true,
            username: true,
          },
        },
      })

    const CHUNK_SIZE = 50

    for (let i = 0; i < recurringDonations.length; i += CHUNK_SIZE) {
      const chunk = recurringDonations.slice(i, i + CHUNK_SIZE)

      await this.donationsService.cancelRecurring({
        id: chunk.map((donation) => donation.id),
      })
    }

    for (const donation of recurringDonations) {
      this.notificationsService.create({
        title: 'Recurring donation to deal has been blocked',
        description: `Recurring donation [${donation.deal.name}] has been blocked by admin due to user account being blocked`,
        user: donation.user.id,
        type: NotificationType.RECURRING_DONATION_BLOCKED,
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          message: `Recurring donation [${donation.deal.name}] has been blocked`,
          deal_id: donation.deal.id,
          deal_name: donation.deal.name,
        },
      })
    }

    return {
      message: `User [${block.id}] has been blocked`,
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
