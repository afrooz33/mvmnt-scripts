import { In } from 'typeorm'
import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CouponStatus, CouponTargetUser } from '@app/src/admin/coupons/enums'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'

export default async function (userId: string): Promise<CouponsEntity[]> {
  try {
    const coupons = await this.findMany({
      where: {
        status: In([CouponStatus.ENABLED, CouponStatus.SCHEDULED]),
      },
      relations: [Query.USER_SEARCH_CONDITIONS],
    })

    const userCoupons = []

    await Promise.all(
      coupons.map(async (coupon) => {
        const couponData = {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discount: coupon.discount,
          coupon_type: coupon.coupon_type,
          discount_type: coupon.discount_type,
          purchase_requirement_type: coupon.purchase_requirement_type,
          purchase_requirement: coupon.purchase_requirement,
          description: coupon.description,
          status: coupon.status,
          start_date: coupon.start_date,
          end_date: coupon.end_date,
          amount: coupon.amount,
          type: coupon.type,
          max_discount: coupon.max_discount,
          min_order_amount: coupon.min_order_amount,
          max_usage: coupon.max_usage,
          max_usage_per_user: coupon.max_usage_per_user,
          max_shipping_fee: coupon.max_shipping_fee,
          is_shipping_fee_excluded: coupon.is_shipping_fee_excluded,
          exclude_shipping_fee: coupon.exclude_shipping_fee,
        }

        if (coupon.target_user == CouponTargetUser.ALL) {
          userCoupons.push(couponData)
        } else {
          const userSearchConditions = coupon.user_search_conditions

          for (const userSearchCondition of userSearchConditions) {
            const { field, condition, values } = userSearchCondition

            const isEligible = await this.checkUserEligibility(userId, field, condition, values)

            if (isEligible) {
              userCoupons.push(couponData)
            }
          }
        }
      }),
    )

    return userCoupons
  } catch (error) {
    return HandleErrors(error)
  }
}
