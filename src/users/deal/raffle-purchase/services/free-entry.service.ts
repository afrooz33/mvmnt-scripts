import { Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { PurchaseStatus } from '@app/src/users/deal/raffle-purchase/enums'

export default async function (dealId: string, userId: string): Promise<SuccessRO> {
  try {
    const deal = await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: dealId,
            status: DealStatus.ON_DEAL,
            deal_type: DealType.RAFFLE,
            user: {
              id: Not(userId),
            },
          },
          select: ['id', 'name'],
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
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    if (deal.user.id === userId) {
      throw new BadRequestException(ErrorKey.CANNOT_ENTRY_FOR_OWN_DEAL)
    }

    const isFreeEntry = await this.rafflePurchaseRepository.findOne({
      where: {
        deal: { id: deal.id },
        user: { id: user.id },
        is_free_entry: true,
      },
    })

    if (isFreeEntry) {
      throw new BadRequestException(ErrorKey.USER_ALREADY_HAS_FREE_ENTRY)
    }

    const rafflePurchase = await this.rafflePurchaseRepository.create({
      deal: {
        id: deal.id,
        name: deal.name,
      },
      user: {
        id: user.id,
      },
      raffle_ticket_price: 0,
      quantity: 1,
      total_amount: 0,
      status: PurchaseStatus.ON_DEAL,
      is_free_entry: true,
    })

    await this.rafflePurchaseRepository.save(rafflePurchase)

    return {
      message: 'Free entry created successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
