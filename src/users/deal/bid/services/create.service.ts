import BigNumber from 'bignumber.js'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { CreateBidDto } from '@app/src/users/deal/bid/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default async function (payload: CreateBidDto, userId: string): Promise<SuccessRO> {
  const deal: DealEntity = await this.dealService.documentExists({
    condition: [
      {
        relations: [
          Query.USER,
          Query.SHIPPING_FEE,
          Query.DONATION_PROJECT,
          Query.DONATION_NONPROFIT,
          Query.DONATION_NONPROFIT_PROFILE,
        ],
        where: {
          id: payload.deal,
          status: DealStatus.ON_DEAL,
          deal_type: DealType.AUCTION,
        },
      },
    ],
    errorMessage: ErrorKey.DEAL_NOT_FOUND,
  })

  const user = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: ['id', 'rank'],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  if (deal.user.id === userId) {
    throw new BadRequestException(ErrorKey.CANNOT_BID_ON_OWN_DEAL)
  }

  if (deal?.user?.account_status !== AccountStatus.ENABLED) {
    throw new BadRequestException(`User [${payload.user}] not found`)
  }

  if (deal.end_date < new Date()) {
    throw new BadRequestException(`Deal [${payload.deal}] is expired`)
  }

  const now = new Date()
  const diff = Math.abs(deal.end_date.getTime() - now.getTime())
  const minutes = Math.floor(diff / 1000 / 60)

  let delivery_cost = 0

  if (deal.shipping_fee) {
    for (const fee of deal.shipping_fee) {
      if (
        payload.bid_amount * payload.quantity >= fee.min_amount &&
        (payload.bid_amount * payload.quantity <= fee.max_amount || !fee.max_amount)
      ) {
        delivery_cost = fee.fee
        break
      }
    }
  }

  const bid: BidEntity = await this.updateOne({
    ...payload,
    delivery_cost,
    total_amount: payload.bid_amount * payload.quantity + delivery_cost,
    user,
  })

  if (minutes <= 10) {
    deal.end_date = new Date(deal.end_date.getTime() + 10 * 60000)
    await this.dealService.updateOne(deal)
  }

  await this.notificationsService.create({
    title: "There's a bid on your auction",
    user: deal.user,
    type: NotificationType.BID_ON_AUCTION,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.DEAL,
    data: {
      deal: deal.id,
      deal_name: deal.name,
      bidder: userId,
    },
  })

  const buyerSellerPoints = await this.userPointsService.calculateDealPoints(
    user,
    deal.user,
    deal,
    new BigNumber(bid.total_amount),
  )

  let donated_to = deal.donation_nonprofit.profile.foundation_name

  if (deal?.donation_project && deal.donation_project.status !== DonationProjectStatus.DEFAULT) {
    donated_to = deal.donation_project.name
  }

  return {
    success: true,
    message: `Bid successfully created`,
    data: {
      ...bid,
      buyer_points: buyerSellerPoints.buyer.total,
      donated_to,
    },
  }
}
