import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CouponStatus } from '@app/src/admin/coupons/enums'
import { Query } from '@app/src/shared/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const existing = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(CouponStatus.DELETED),
          },
          relations: [
            Query.COUNTRIES,
            Query.TRANSLATIONS,
            Query.COUPON_TARGET_USER,
            Query.COUPON_TARGET_DEAL,
            Query.USER_SEARCH_CONDITIONS,
            `${Query.COUPON_TARGET_DEAL}.${Query.DEAL}`,
            `${Query.COUPON_TARGET_DEAL}.${Query.VARIANT}`,
          ],
        },
      ],
      errorMessage: JSON.stringify({
        key: 'Coupon does not exist',
        args: { id },
      }),
    })

    delete existing.id

    const newCoupon = {
      ...existing,
      status: CouponStatus.DRAFT,
    }

    const totalCoupon = await this.couponsRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    })

    newCoupon.code = `${newCoupon.code}+C${totalCoupon + 1}`

    newCoupon.users = existing.users.map((user) => user.id)
    newCoupon.user_search_conditions = existing.user_search_conditions.map((condition) => ({
      field: condition.field,
      condition: condition.condition,
      values: condition.values,
    }))
    newCoupon.deals_variants = existing.deals_variants.map((deal) => ({
      deal: deal.deal.id,
      variant: deal.variant ? deal.variant.id : null,
    }))

    const coupon = await this.create(newCoupon, userId)

    return {
      success: true,
      message: 'Coupon duplicated successfully',
      data: coupon,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
