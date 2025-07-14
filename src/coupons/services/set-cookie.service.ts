import { Response } from 'express'
import { ErrorKey } from '@app/src/shared/enums'
import { setCookieService } from '@app/src/shared/services'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CouponCodeDto } from '@app/src/coupons/dto'
import { CouponStatus } from '@app/src/admin/coupons/enums'

export default async function (res: Response, payload: CouponCodeDto): Promise<any> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            code: payload.coupon_code,
            status: CouponStatus.ENABLED,
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.INVALID_COUPON_CODE,
        args: { code: payload.coupon_code },
      }),
    })

    await setCookieService(res, payload.coupon_code, 'x-discount-code')

    return res.json({ message: 'Coupon code set' })
  } catch (error) {
    return HandleErrors(error)
  }
}
