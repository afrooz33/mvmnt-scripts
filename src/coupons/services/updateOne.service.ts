import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateCouponDto } from '@app/src/coupons/dto'
import { Not } from 'typeorm'
import { CouponStatus } from '@app/src/admin/coupons/enums'

export default async function (
  id: string,
  payload: UpdateCouponDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const existing = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
          },
          select: ['id', 'status', 'start_date', 'end_date'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.INVALID_COUPON,
        args: { id },
      }),
    })

    if (payload.code) {
      const couponCodeExists = await this.findOne({
        where: {
          id: Not(id),
          code: payload.code,
        },
        select: ['id'],
      })

      if (couponCodeExists) {
        throw new PreconditionFailedException(
          JSON.stringify({
            key: ErrorKey.INVALID_COUPON_CODE,
            args: { coupon_code: payload.code },
          }),
        )
      }
    }

    if (existing.start_date !== payload.start_date) {
      await this.setCouponSchedule(
        payload.start_date,
        `Enable coupon [${existing.id}]`,
        payload,
        CouponStatus.ENABLED,
      )
    }

    if (existing.end_date !== payload.end_date) {
      await this.setCouponSchedule(
        payload.end_date,
        `Disable coupon [${existing.id}]`,
        existing,
        CouponStatus.EXPIRED,
      )
    }

    let status = existing.status

    if (existing.status === CouponStatus.DRAFT) {
      status = CouponStatus.ENABLED

      if (new Date(payload.start_date) > new Date()) {
        status = CouponStatus.SCHEDULED

        await this.setCouponSchedule(
          payload.start_date,
          `Enable coupon [${existing.id}]`,
          payload,
          CouponStatus.ENABLED,
        )
      }

      await this.setCouponSchedule(
        payload.end_date,
        `Disable coupon [${existing.id}]`,
        existing,
        CouponStatus.EXPIRED,
      )
    }

    return await this.create(
      {
        ...payload,
        id,
        status,
      },
      userId,
    )
  } catch (error) {
    return HandleErrors(error)
  }
}
