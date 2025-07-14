import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'

export default async function (bidId: string, dealId: string, userId: string): Promise<SuccessRO> {
  try {
    const bid: BidEntity = await this.documentExists({
      condition: [
        {
          relations: [Query.DEAL, Query.USER],
          where: {
            id: bidId,
            deal: {
              id: dealId,
              user: {
                id: userId,
              },
            },
            user: {
              account_status: AccountStatus.ENABLED,
            },
            status: In([BidStatus.PENDING, BidStatus.REJECTED]),
          },
          select: ['id', 'bid_amount', 'deal.id', 'user.id'],
        },
      ],
      message: ErrorKey.RESOURCE_NOT_FOUND,
    })

    await this.updateOne({
      id: bidId,
      status: BidStatus.AWARDED,
    })

    await this.notificationsService.create({
      title: "You've won the auction",
      user: bid.user,
      type: NotificationType.BID_ON_AUCTION,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: bid.deal.id,
        deal_name: bid.deal.name,
        price: bid.bid_amount,
      },
    })

    return {
      success: true,
      message: 'Bid awarded successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
