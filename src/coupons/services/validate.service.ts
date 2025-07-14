import { SuccessRO } from '@app/src/shared/dto'
import { CouponStatus } from '@app/src/admin/coupons/enums'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { ForbiddenException } from '@nestjs/common'

export default async function (userId: string, code: string): Promise<SuccessRO> {
  const coupon = await this.documentExists({
    condition: [
      {
        where: {
          code,
          status: CouponStatus.ENABLED,
        },
        relations: [Query.USER_SEARCH_CONDITIONS],
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.INVALID_COUPON,
      args: { code },
    }),
  })

  const userSearchConditions = coupon.user_search_conditions

  for (const userSearchCondition of userSearchConditions) {
    const { field, condition, values } = userSearchCondition

    const isEligible = await this.checkUserEligibility(userId, field, condition, values)

    if (!isEligible) {
      throw new ForbiddenException('You are not eligible for this coupon')
    }
  }

  return {
    success: true,
    message: 'Coupon is valid',
    data: coupon,
  }
}
