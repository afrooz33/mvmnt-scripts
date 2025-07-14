import { Job } from 'bullmq'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { ErrorKey } from '@app/src/shared/enums'
import { BullMqQuery } from '@app/src/shared/constant'
import { TaskSchedulerEntity } from '@app/src/task-scheduler/entities/task-scheduler.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'
import { DealService } from '@app/src/users/deal/deal.service'
import { DealStatus } from '@app/src/users/deal/enums'

@Processor(BullMqQuery.USER_DEAL_QUEUE)
export class DealProcessor extends WorkerHost {
  constructor(
    private readonly dealService: DealService,
    private readonly taskSchedulerService: TaskSchedulerService,
  ) {
    super()
  }

  async process(job: Job<any>): Promise<any> {
    const task: TaskSchedulerEntity = await this.taskSchedulerService.documentExists({
      condition: [
        {
          where: {
            job_id: job.id,
            name: job.name,
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RESOURCE_NOT_FOUND,
        args: { id: job.id },
      }),
    })

    try {
      await this.dealService.updateOne(
        {
          id: job.data.id,
          status: DealStatus.ON_DEAL,
        },
        {
          where: {
            id: job.data.id,
            status: DealStatus.SCHEDULED,
          },
        },
      )

      task.status = TaskScheduleStatus.COMPLETED

      await task.save()

      return Promise.resolve(job)
    } catch (error) {
      task.status = TaskScheduleStatus.FAILED
      task.error = error.message ?? error

      await task.save()
    }
  }
}
