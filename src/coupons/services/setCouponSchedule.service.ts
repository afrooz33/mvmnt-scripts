import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'

export default async function (
  date: string,
  name: string,
  coupon: CouponsEntity,
  status: string,
): Promise<void> {
  try {
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

    const currentDate: any = new Date()
    const schedule_date: any = new Date(date)

    const couponSchedule = await this.couponsQueue.add(
      name,
      {
        id: coupon.id,
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
  } catch (error) {
    return HandleErrors(error)
  }
}
