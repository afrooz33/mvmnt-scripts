import { MethodNotAllowedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'
import { UpdateCouponDto } from '@app/src/admin/coupons/dto'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { CouponStatus } from '@app/src/admin/coupons/enums'

async function updateCouponSchedule(
  name: string,
  date: any,
  updatedCoupon: CouponsEntity,
  status: CouponStatus,
) {
  const existingTask = await this.taskSchedulerService.findOne({
    where: {
      name,
      status: TaskScheduleStatus.PENDING,
    },
  })

  if (existingTask) {
    const jobToRemove = await this.couponsQueue.getJob(existingTask.job_id)

    await jobToRemove?.remove()

    existingTask.status = TaskScheduleStatus.DELETED

    await this.taskSchedulerService.updateOne(existingTask)
  }

  const schedule_date: any = new Date(date)
  const currentDate: any = new Date()

  const couponSchedule = await this.couponsQueue.add(
    name,
    {
      id: updatedCoupon.id,
      start_date: date,
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
    scheduled_at: date,
  })
}

export default async function (id: string, payload: UpdateCouponDto) {
  const coupon: CouponsEntity = await this.findOne({
    where: {
      id,
      status: CouponStatus.ENABLED,
    },
  })

  if (coupon && payload.status !== CouponStatus.ENABLED) {
    throw new MethodNotAllowedException(ErrorKey.PUBLISHED_STATUS_UPDATE_NOT_ALLOWED)
  }

  if (payload.status === CouponStatus.ENABLED) {
    payload.start_date = new Date()
  }

  const resource: CouponsEntity = await this.couponsRepository.create({
    ...coupon,
    ...payload,
  })

  const updatedCoupon: CouponsEntity = await this.couponsRepository.save(resource)

  if (updatedCoupon.end_date) {
    await updateCouponSchedule.bind(this)(
      `Disable coupon [${updatedCoupon.id}]`,
      updatedCoupon.end_date,
      updatedCoupon,
      CouponStatus.EXPIRED,
    )
  }

  return updatedCoupon
}
