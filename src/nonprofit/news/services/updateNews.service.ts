import { MethodNotAllowedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { NewsStatus } from '@app/src/nonprofit/news/enums'
import { UpdateNewsDto } from '@app/src/nonprofit/news/dto'
import { NewsEntity } from '@app/src/nonprofit/news/entities/news.entity'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'

export default async function (id: string, payload: UpdateNewsDto, user: string) {
  const news: NewsEntity = await this.findOne({
    where: {
      id,
      user: { id: user },
      status: NewsStatus.PUBLISHED,
    },
  })

  if (news && payload.status !== NewsStatus.PUBLISHED) {
    throw new MethodNotAllowedException(ErrorKey.PUBLISHED_STATUS_UPDATE_NOT_ALLOWED)
  }

  if (payload.status === NewsStatus.PUBLISHED) {
    payload.published_date = payload.published_date = new Date()
  }

  const updatedNews: NewsEntity = await this.updateOne({
    ...news,
    ...payload,
  })

  if (updatedNews.schedule_date && payload.status === NewsStatus.SCHEDULED) {
    const name = `Publish news [${updatedNews.id}]`

    const existingTask = await this.taskSchedulerService.findOne({
      where: {
        name,
        status: TaskScheduleStatus.PENDING,
      },
    })

    if (existingTask) {
      const jobToRemove = await this.newsQueue.getJob(existingTask.job_id)

      await jobToRemove?.remove()

      existingTask.status = TaskScheduleStatus.DELETED

      await this.taskSchedulerService.updateOne(existingTask)
    }

    const schedule_date: any = new Date(updatedNews.schedule_date)
    const currentDate: any = new Date()

    const newsSchedule = await this.newsQueue.add(
      name,
      {
        id: updatedNews.id,
        schedule_date: updatedNews.schedule_date,
      },
      {
        delay: schedule_date - currentDate,
        removeOnComplete: true,
        removeOnFail: false,
      },
    )

    await this.taskSchedulerService.create({
      job_id: newsSchedule.id,
      name,
      data: newsSchedule.data,
      scheduled_at: updatedNews.schedule_date,
    })
  }

  return news
}
