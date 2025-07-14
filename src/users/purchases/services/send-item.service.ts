import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function sendItemService(
  id: string,
  dealId: string,
  userId: string,
): Promise<SuccessRO> {
  try {
    const deal = await this.dealRepository.findOne({
      where: {
        id: dealId,
        user: { id: userId },
        status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
        deal_type: In([DealType.BUYNOW, DealType.AUCTION]),
      },
      select: ['id', 'status', 'deal_type'],
    })

    if (!deal) {
      throw new BadRequestException(`Deal with ID ${dealId} not found for user ID ${userId}`)
    }

    if (deal.deal_type === DealType.BUYNOW) {
      const cart = await this.cartRepository.findOne({
        where: {
          deal: { id: dealId },
          id,
          status: In([CartStatus.WAITING_SHIPMENT]),
        },
        select: ['id', 'status'],
      })

      if (!cart) {
        throw new BadRequestException(`Invalid buynow purchase ID ${id} for deal ID ${dealId}`)
      }

      await this.cartRepository.update(
        {
          id,
          deal: { id: dealId },
        },
        {
          status: CartStatus.SHIPPED,
        },
      )
    }

    if (deal.deal_type === DealType.AUCTION) {
      const bid = await this.bidRepository.findOne({
        where: {
          deal: { id: dealId },
          id,
          status: In([BidStatus.WAITING_SHIPMENT]),
        },
        select: ['id', 'status'],
      })

      if (!bid) {
        throw new BadRequestException(`Invalid bid ID ${id} for deal ID ${dealId}`)
      }

      await this.bidRepository.update(
        {
          id,
          deal: { id: dealId },
        },
        {
          status: BidStatus.COMPLETED,
        },
      )
    }

    return {
      success: true,
      message: 'Item sent successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
