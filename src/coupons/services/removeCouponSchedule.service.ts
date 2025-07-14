import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'

export default async function (name: string): Promise<void> {
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

    return
  } catch (error) {
    return HandleErrors(error)
  }
}
