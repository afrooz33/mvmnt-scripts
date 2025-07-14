import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { RejectBidDto } from '@app/src/users/deal/bid/dto'

export default async function rejectService(
  payload: RejectBidDto,
  dealId: string,
  userId: string,
): Promise<SuccessRO> {
  try {
    await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: dealId,
            user: {
              id: userId,
            },
            status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
          },
          select: ['id', 'name'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.DEAL_NOT_FOUND,
        args: { id: dealId },
      }),
    })

    const bids = await this.bidRepository.find({
      where: {
        id: In(payload.bidIds),
        deal: {
          id: dealId,
        },
      },
      select: ['id', 'status'],
    })

    if (bids.length !== payload.bidIds.length) {
      throw new BadRequestException(
        JSON.stringify({
          key: ErrorKey.INVALID_BID,
          args: { id: payload.bidIds },
        }),
      )
    }

    await this.bidRepository.update(
      {
        id: In(payload.bidIds),
      },
      {
        status: BidStatus.REJECTED,
        reject_reason: payload?.reject_reason,
      },
    )

    return {
      success: true,
      message: 'Bid rejected successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
