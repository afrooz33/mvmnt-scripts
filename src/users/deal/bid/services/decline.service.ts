import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'

export default async function (bidId: string, dealId: string, userId: string): Promise<SuccessRO> {
  try {
    const bid: BidEntity = await this.documentExists({
      condition: [
        {
          where: {
            id: bidId,
            user: {
              id: userId,
            },
            deal: {
              id: dealId,
            },
            status: In([BidStatus.AWARDED]),
          },
        },
      ],
    })

    await this.updateOne({
      ...bid,
      decline_date: new Date(),
      status: BidStatus.DECLINED,
    })

    return {
      message: 'Bid declined successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
