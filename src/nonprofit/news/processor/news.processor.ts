import { Job } from 'bullmq'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { ErrorKey } from '@app/src/shared/enums'
import { BullMqQuery } from '@app/src/shared/constant'
import { NewsStatus } from '@app/src/nonprofit/news/enums'
import { NewsService } from '@app/src/nonprofit/news/news.service'
import { TaskSchedulerEntity } from '@app/src/task-scheduler/entities/task-scheduler.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'

@Processor(BullMqQuery.NONPROFIT_NEWS_QUEUE)
export class NewsProcessor extends WorkerHost {
  constructor(
    private readonly newsService: NewsService,
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
      await this.newsService.updateOne(
        {
          id: job.data.id,
          status: NewsStatus.PUBLISHED,
        },
        {
          where: {
            id: job.data.id,
            status: NewsStatus.SCHEDULED,
          },
        },
      )

      task.status = TaskScheduleStatus.COMPLETED

      await task.save()

      try {
        const news = await this.newsService.findOne({
          where: {
            id: job.data.id,
          },
        })

        const nonprofit = await this.newsService.getNonprofitUserIdByNewsId(news.id)

        await this.newsService.sendNewsNotification(news, nonprofit)
      } catch (error) {
        console.error('NewsProcessor error:', error.message ?? error)
      }

      return Promise.resolve(job)
    } catch (error) {
      task.status = TaskScheduleStatus.FAILED
      task.error = error.message ?? error

      await task.save()
    }
  }
}
