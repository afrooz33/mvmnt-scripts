import { BadRequestException, PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { CreateCouponDto } from '@app/src/admin/coupons/dto'
import { CouponStatus } from '@app/src/admin/coupons/enums'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'

async function setCouponSchedule(
  date: any,
  name: string,
  coupon: CouponsEntity,
  status: CouponStatus,
) {
  const schedule_date: any = new Date(date)
  const currentDate: any = new Date()

  const couponSchedule = await this.couponsQueue.add(
    name,
    {
      id: coupon.id,
      start_date: coupon.start_date,
      status,
    },
    {
      delay: schedule_date - currentDate,
      removeOnComplete: true,
      removeOnFail: false,
    },
  )

  await this.taskSchedulerService.create({
    job_id: couponSchedule.id,
    name,
    data: couponSchedule.data,
    scheduled_at: coupon.start_date,
  })
}

export default async function (payload: CreateCouponDto): Promise<SuccessRO> {
  try {
    if (payload.status === CouponStatus.ENABLED) {
      payload.start_date = new Date()
    }

    const resource: CouponsEntity = await this.couponsRepository.create(payload)

    const coupon: CouponsEntity = await this.couponsRepository.save(resource)

    if (coupon.end_date) {
      await setCouponSchedule.bind(this)(
        coupon.end_date,
        `Disable coupon [${coupon.id}]`,
        coupon,
        CouponStatus.EXPIRED,
      )
    }

    return {
      success: true,
      message: `Coupon [${coupon.id}] successfully saved`,
      data: coupon,
    }
  } catch (error) {
    if (error.message.includes('violates check constraint')) {
      throw new PreconditionFailedException(ErrorKey.INVALID_COUPON_CONDITION)
    } else {
      throw new BadRequestException(error.message)
    }
  }
}
