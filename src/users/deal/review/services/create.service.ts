import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DealType, DealStatus } from '@app/src/users/deal/enums'
import { CreateReviewDto } from '@app/src/users/deal/review/dto'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealReviewEntity } from '@app/src/users/deal/review/entities/review.entity'

export default async function (payload: CreateReviewDto, user: any): Promise<SuccessRO> {
  try {
    const deal: DealEntity = await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: payload.deal,
            user: Not(user.id),
            deal_type: In([DealType.BUYNOW, DealType.AUCTION]),
            status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
          },
          select: ['id', 'deal_type'],
        },
      ],
      errorMessage: JSON.stringify(ErrorKey.DEAL_NOT_FOUND),
    })

    if (deal.deal_type === DealType.AUCTION) {
      const purchase = await this.entityManager.findOne('user_deal_item_payment', {
        where: {
          payment: {
            user: {
              id: user.id,
            },
            deal_type: DealType.AUCTION,
            status: In([PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED]),
          },
          deal: {
            id: deal.id,
          },
        },
        select: {
          id: true,
          bid: {
            id: true,
          },
        },
      })

      if (!purchase) {
        throw new BadRequestException(ErrorKey.DEAL_NOT_FOUND)
      }

      await this.entityManager.update(
        'user_deal_bids',
        {
          id: purchase.bid.id,
        },
        { status: BidStatus.COMPLETED },
      )
    }

    if (deal.deal_type === DealType.BUYNOW) {
      const purchaseStatus = await this.entityManager.findOne('user_deal_buynow_cart', {
        where: {
          status: CartStatus.REVIEW_DEAL,
          user: {
            id: user.id,
          },
          deal: {
            id: deal.id,
          },
        },
        select: ['id'],
      })

      if (!purchaseStatus) {
        throw new BadRequestException(ErrorKey.DEAL_NOT_FOUND)
      }

      await this.entityManager.update(
        'user_deal_buynow_cart',
        {
          id: purchaseStatus.id,
        },
        {
          status: CartStatus.COMPLETED,
        },
      )
    }

    const review: DealReviewEntity = await this.updateOne({
      ...payload,
      ...user,
    })

    await this.notificationsService.create({
      title: `Your listed ${deal.deal_type.toLowerCase()} deal has received a review`,
      user: deal.user,
      type: NotificationType.DEAL_RECEIVED_REVIEW,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: deal.id,
        deal_name: deal.name,
        username: user.username,
        deal_type: deal.deal_type,
      },
    })

    return {
      success: true,
      message: 'Review has been created successfully',
      data: review,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
