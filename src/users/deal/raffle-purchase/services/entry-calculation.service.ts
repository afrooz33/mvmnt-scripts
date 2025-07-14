import BigNumber from 'bignumber.js'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default async function (
  dealId: string,
  userId: string,
  quantity: number,
): Promise<SuccessRO> {
  try {
    const deal: DealEntity = await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: dealId,
            status: DealStatus.ON_DEAL,
            deal_type: DealType.RAFFLE,
          },
          select: {
            id: true,
            starting_price: true,
            user: {
              id: true,
              rank: true,
              account_status: true,
              account_type: true,
            },
            donation_nonprofit: {
              id: true,
              profile: {
                foundation_name: true,
                profile_image: {
                  url: true,
                },
              },
            },
            donation_project: {
              id: true,
              name: true,
              status: true,
              images: {
                url: true,
              },
            },
          },
          relations: [
            Query.USER,
            Query.DONATION_PROJECT,
            Query.DONATION_NONPROFIT,
            Query.DONATION_NONPROFIT_PROFILE,
            `${Query.DONATION_PROJECT}.images`,
            `${Query.DONATION_NONPROFIT_PROFILE}.profile_image`,
          ],
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

    const buyerSellerPoints = await this.userPointsService.calculateDealPoints(
      user,
      deal.user,
      deal,
      new BigNumber(deal.starting_price * quantity),
    )

    const donated_to = {
      nonprofit: deal.donation_nonprofit,
      donation_project: deal.donation_project,
    }

    return {
      success: true,
      message: `Entry calculation successfully done`,
      data: {
        total_price: deal.starting_price * quantity,
        total_entries: quantity,
        buyer_points: buyerSellerPoints.buyer.total,
        donated_to,
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
