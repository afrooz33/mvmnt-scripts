import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { NewsStatus } from '@app/src/nonprofit/news/enums'
import { CreateNewsDto } from '@app/src/nonprofit/news/dto'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { NewsEntity } from '@app/src/nonprofit/news/entities/news.entity'

export default async function (payload: CreateNewsDto, user: string): Promise<SuccessRO> {
  const nonprofit = await this.nonprofitUserService.findOne({
    where: {
      id: user,
      account_status: AccountStatus.ACTIVE,
    },
    select: ['id'],
  })

  if (!nonprofit) {
    throw new NotFoundException('Nonprofit not found')
  }

  if (payload.status === NewsStatus.PUBLISHED) {
    payload.published_date = new Date()
  }

  const news: NewsEntity = await this.updateOne({
    ...payload,
    user: {
      id: user,
    },
  })

  if (news.schedule_date && payload.status === NewsStatus.SCHEDULED) {
    const schedule_date: any = new Date(news.schedule_date)
    const currentDate: any = new Date()
    const name = `Publish news [${news.id}]`

    const newsSchedule = await this.newsQueue.add(
      name,
      {
        id: news.id,
        schedule_date: news.schedule_date,
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
      scheduled_at: news.schedule_date,
    })
  }

  if (payload.status === NewsStatus.PUBLISHED) {
    try {
      await this.sendNewsNotification(news, nonprofit.id)
    } catch (error) {
      console.error('Failed to send news notification:', error)
    }
  }

  return {
    success: true,
    message: `News [${news.id}] successfully saved`,
    data: news,
  }
}
