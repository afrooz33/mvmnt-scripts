import { Job } from 'bullmq'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { BullMqQuery } from '@app/src/shared/constant'
import { ErrorKey } from '@app/src/shared/enums'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { TaskSchedulerEntity } from '@app/src/task-scheduler/entities/task-scheduler.entity'

@Processor(BullMqQuery.DONATION_PROJECT_QUEUE)
export class DonationProjectProcessor extends WorkerHost {
  constructor(
    private readonly donationProjectsService: DonationProjectsService,
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
      await this.donationProjectsService.updateOne(
        {
          id: job.data.id,
          status: DonationProjectStatus.PUBLISHED,
        },
        {
          where: {
            id: job.data.id,
            status: DonationProjectStatus.SCHEDULED,
          },
        },
      )

      task.status = TaskScheduleStatus.COMPLETED

      await task.save()

      return Promise.resolve(job)
    } catch (error) {
      task.status = TaskScheduleStatus.FAILED
      task.error = error

      await task.save()
    }
  }
}
