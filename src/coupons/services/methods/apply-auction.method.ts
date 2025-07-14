import { In } from 'typeorm'
import { ForbiddenException, UnprocessableEntityException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto/SuccessRO'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { DealStatus } from '@app/src/users/deal/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { ApplyCodeQueryDto } from '@app/src/coupons/dto/apply-code-query.dto'
import { CouponTargetDeal } from '@app/src/admin/coupons/enums'

export default async function (
  query: ApplyCodeQueryDto,
  userId: string,
  coupon,
): Promise<SuccessRO> {
  try {
    const bid = await this.bidRepository.findOne({
      where: {
        id: query.bid,
        user: {
          id: userId,
        },
        status: BidStatus.AWARDED,
        deal: {
          deal_type: DealType.AUCTION,
          status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
        },
      },
      relations: ['deal', 'address', 'address.country'],
      select: {
        id: true,
        deal: {
          id: true,
        },
        address: {
          id: true,
          country: {
            id: true,
          },
        },
      },
    })

    if (!bid) {
      throw new UnprocessableEntityException(ErrorKey.INVALID_BID)
    }

    // check if coupon is valid and user can use it,
    // check for start date, end date, max usage, max usage per user, user search conditions
    await this.CheckCouponValidity(coupon, userId)

    if (coupon.target_deal !== CouponTargetDeal.ALL) {
      if (!coupon.deals_variants.some((dv) => dv.deal.id === bid.deal.id)) {
        throw new ForbiddenException(ErrorKey.INVALID_COUPON_DEALS)
      }
    }

    await this.bidRepository.update(bid.id, {
      coupon: {
        id: coupon.id,
      },
    })

    return {
      message: 'Coupon applied successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
