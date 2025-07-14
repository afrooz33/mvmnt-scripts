import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { POINTS_REASON, POINTS_STATUS, POINTS_TYPE } from '@app/src/users/points/enums'

export default async function (user: UserEntity, amount: number): Promise<void> {
  try {
    const mvmntToken = await this.tokensService.getMVMVNTToken()
    const points = await this.calculateDonationPoints(user, amount)

    await this.updateOne({
      user,
      amount: points.amount,
      remaining: points.amount,
      status: POINTS_STATUS.LOCKED,
      expiry_date: points.expiry_date,
      delivery_date: points.delivery_date,
      type: POINTS_TYPE.SHOPIFY_INTEGRATION,
      reason: POINTS_REASON.RE2_SHOPIFY_INTEGRATION,
      withdraw_currency: {
        id: mvmntToken.id,
      },
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
