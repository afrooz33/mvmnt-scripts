import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { DeleteDealDto } from '@app/src/users/deal/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { RestrictionType } from '@app/src/users/restrictions/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default async function (
  id: string,
  userId: string,
  payload: DeleteDealDto,
): Promise<SuccessRO> {
  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: ['id', 'account_status', 'account_type'],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  const restriction = await this.restrictionService.findOne({
    where: {
      user: {
        id: user.id,
      },
      restriction_type: RestrictionType.AUCTION_DEAL_DELETION,
    },
    select: ['id', 'data'],
  })

  const deal: DealEntity = await this.documentExists({
    condition: [
      {
        where: {
          id,
          user: {
            id: user.id,
          },
          status: Not(In([DealStatus.DELETED, DealStatus.TERMINATED, DealStatus.DELETE_REQUESTED])),
        },
        select: ['id', 'deal_type', 'status', 'name'],
      },
    ],
    errorMessage: ErrorKey.DEAL_NOT_FOUND,
  })

  if (deal.deal_type === DealType.AUCTION) {
    await this.deleteAuctionDeal(id, user, restriction, deal, payload)
  }

  if (deal.deal_type === DealType.BUYNOW) {
    await this.deleteBuyNowDeal(deal)
  }

  if (deal.deal_type === DealType.RAFFLE) {
    await this.deleteRaffleDeal(deal)
  }

  return {
    message: 'Deal deleted successfully',
    success: true,
  }
}
