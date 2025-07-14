import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'account_status', 'account_type'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: userId },
      }),
    })

    const deal = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: user.id,
            },
            status: Not(In([DealStatus.DELETED, DealStatus.DELETE_REQUESTED])),
            deal_type: DealType.BUYNOW,
          },
          select: ['id', 'deal_type', 'status'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    deal.status = DealStatus.HIDDEN

    await this.updateOne(deal)

    return {
      success: true,
      message: 'Deal status changed successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
