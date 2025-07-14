import { In } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto/SuccessRO'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { ApplyCodeQueryDto } from '@app/src/coupons/dto/apply-code-query.dto'
import { CouponTargetDeal } from '@app/src/admin/coupons/enums'
import { ForbiddenException } from '@nestjs/common'
import { CalculateDiscount } from '@app/src/shared/helpers/CalculateDiscount.helper'

export default async function (
  query: ApplyCodeQueryDto,
  userId: string,
  coupon,
): Promise<SuccessRO> {
  try {
    const raffle = await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: query.raffle,
            status: In([DealStatus.ON_DEAL]),
          },
          select: ['id', 'name', 'starting_price'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    // check if coupon is valid and user can use it,
    // check for start date, end date, max usage, max usage per user, user search conditions
    await this.CheckCouponValidity(coupon, userId)

    if (coupon.target_deal !== CouponTargetDeal.ALL) {
      if (!coupon.deals_variants.some((dv) => dv.deal.id === raffle.id)) {
        throw new ForbiddenException(ErrorKey.INVALID_COUPON_DEALS)
      }
    }

    //based on coupon type and discount type, apply the discount
    const discount = await CalculateDiscount(coupon, {
      total: raffle.starting_price,
      is_buynow: false,
    })

    return {
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          id: coupon.id,
          name: coupon.name,
          discount: coupon.discount,
          coupon_type: coupon.coupon_type,
          discount_type: coupon.discount_type,
        },
        discount,
        deal: {
          id: raffle.id,
          name: raffle.name,
          starting_price: raffle.starting_price,
        },
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
