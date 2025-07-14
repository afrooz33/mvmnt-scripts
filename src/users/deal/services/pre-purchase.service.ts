import { In, Not } from 'typeorm'
import { BigNumber } from 'bignumber.js'
import { Status, ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { PrePurchaseDto } from '@app/src/users/deal/dto'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { calculateDonation } from '@app/src/donations/helper/calculate.helper'

export default async function prePurchaseService(
  query: PrePurchaseDto,
  userId: string,
): Promise<any> {
  try {
    const deal = await this.documentExists({
      condition: [
        {
          where: {
            id: query.deal,
            status: Not(Status.DELETED),
          },
          relations: ['user'],
          select: {
            id: true,
            user: {
              id: true,
              rank: true,
              account_type: true,
            },
            end_date: true,
            deal_type: true,
            donation_type: true,
            starting_price: true,
            donation_amount: true,
          },
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    let user = {
      id: null,
      rank: 'Bronze',
      account_type: UserAccountType.INDIVIDUAL_INFLUENCER,
    }

    if (userId) {
      user = await this.userService.documentExists({
        condition: [
          {
            where: {
              id: userId,
              account_status: AccountStatus.ENABLED,
            },
            select: {
              id: true,
              rank: true,
              account_type: true,
            },
          },
        ],
        errorMessage: ErrorKey.USER_NOT_FOUND,
      })
    }

    let points = 0
    let higestBid = null

    if (deal.deal_type === DealType.AUCTION) {
      query.quantity = 1

      higestBid = await this.entityManager.findOne(BidEntity, {
        where: {
          deal: {
            id: deal.id,
          },
          status: Not(In([BidStatus.CANCELLED, BidStatus.REJECTED, BidStatus.DECLINED])),
        },
        order: {
          bid_amount: 'DESC',
        },
        select: {
          id: true,
          bid_amount: true,
        },
        take: 1,
      })
    }

    const donation = calculateDonation(
      deal.donation_type,
      deal.donation_amount,
      query.quantity,
      query.bid_amount,
    )

    if (query?.bid_amount) {
      const point = await this.userPointsService.calculateDealPoints(
        user,
        deal.user,
        deal,
        BigNumber(query.bid_amount),
      )

      points = point?.buyer?.total
    }

    return {
      points,
      donation,
      higest_bid: higestBid,
      deal_end_date: deal.end_date,
      deal_starting_price: deal.starting_price,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
