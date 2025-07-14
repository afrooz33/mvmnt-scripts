import { UnprocessableEntityException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto/SuccessRO'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { ApplyCodeQueryDto } from '@app/src/coupons/dto/apply-code-query.dto'
import { applyBuynowMethod, applyAuctionMethod, applyRaffleMethod } from './methods'

export default async function (
  query: ApplyCodeQueryDto,
  code: string,
  userId: string,
): Promise<SuccessRO> {
  try {
    const coupon = await this.GetCoupon(code)

    if (query.deal_type === DealType.BUYNOW) {
      return applyBuynowMethod.bind(this)(query, userId, coupon)
    }

    if (query.deal_type === DealType.AUCTION) {
      return applyAuctionMethod.bind(this)(query, userId, coupon)
    }

    if (query.deal_type === DealType.RAFFLE) {
      return applyRaffleMethod.bind(this)(query, userId, coupon)
    }

    throw new UnprocessableEntityException(ErrorKey.INVALID_COUPON)
  } catch (error) {
    return HandleErrors(error)
  }
}
