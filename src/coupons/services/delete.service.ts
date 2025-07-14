import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { DeleteRecordDto, SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CouponStatus } from '@app/src/admin/coupons/enums'

export default async function (payload: DeleteRecordDto, userId: string): Promise<SuccessRO> {
  try {
    const coupons = await this.couponsRepository.find({
      where: {
        id: In(payload.ids),
        user: {
          id: userId,
        },
        status: Not(In([CouponStatus.DELETED])),
      },
      select: ['id'],
    })

    if (coupons.length !== payload.ids.length) {
      throw new PreconditionFailedException(
        JSON.stringify({
          key: ErrorKey.INVALID_COUPON,
          args: { id: payload.ids },
        }),
      )
    }

    await this.couponsRepository.update(
      {
        id: In(payload.ids),
        user: {
          id: userId,
        },
      },
      {
        status: CouponStatus.DELETED,
      },
    )

    return {
      success: true,
      message: 'Coupon deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
