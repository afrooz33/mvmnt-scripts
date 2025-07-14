import { In } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BidStatus } from '@app/src/users/deal/bid/enums'

export default async function (dealId: string): Promise<any> {
  try {
    const bid = await this.bidRepository.findOne({
      where: {
        deal: {
          id: dealId,
        },
        status: In([BidStatus.AWARDED, BidStatus.COMPLETED, BidStatus.WAITING_SHIPMENT]),
      },
      relations: ['user', 'user.profile', 'user.profile.profile_images'],
      select: {
        id: true,
        total_amount: true,
        delivery_cost: true,
        user: {
          id: true,
          display_name: true,
          username: true,
          profile: {
            id: true,
            profile_images: {
              url: true,
            },
          },
        },
      },
    })

    if (!bid) {
      throw new NotFoundException(ErrorKey.AUCTION_WINNER_NOT_FOUND)
    }

    return bid
  } catch (error) {
    return HandleErrors(error)
  }
}
