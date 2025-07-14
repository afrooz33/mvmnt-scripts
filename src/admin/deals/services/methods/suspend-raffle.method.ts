import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DealType } from '@app/src/users/deal/enums'

export default async function (deal) {
  try {
    const rafflePurchases = await this.userDealItemPaymentRepository.find({
      where: {
        deal: {
          id: deal.id,
          deal_type: DealType.RAFFLE,
        },
      },
      select: {
        id: true,
        payment: {
          user: {
            id: true,
            email: true,
            display_name: true,
          },
        },
      },
      relations: {
        payment: {
          user: true,
        },
      },
    })

    await this.notificationsService.create({
      title: `Raffle ${deal.name} has been suspended`,
      user: deal.user.id,
      type: NotificationType.DEAL_STATUS_CHANGED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: deal.id,
        deal_name: deal.name,
        seller: deal.user.display_name,
      },
    })

    if (rafflePurchases.length) {
      const users = await Promise.all(
        rafflePurchases.map(async (purchase) => ({
          id: purchase.payment.user.id,
          email: purchase.payment.user.email,
          display_name: purchase.payment.user.display_name,
        })),
      )

      // ToDo: vivek - below logic to be added
      /**
       * Entrants will receive a full refund in points immediately. Any pending points associated with this deal (including returned gas fees to the buyer, points redemption for both buyer and seller, and sales amount) will also be voided.
       */

      await this.notifyParticipants(users, deal)
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
