import { Queue } from 'bullmq'
import { Repository } from 'typeorm'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { BullMqQuery } from '@app/src/shared/constant'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import {
  NotificationReceiverType,
  NotificationRelatedTo,
  NotificationType,
} from '@app/src/notifications/enums'
import { createService, updateNewsService } from './services'
import { NewsEntity } from './entities/news.entity'
import { GetNonprofitDonatedUserQuery } from '@app/src/shared/sql'

@Injectable()
export class NewsService extends MyService<NewsEntity> {
  constructor(
    @InjectRepository(NewsEntity)
    private newsRepository: Repository<NewsEntity>,
    @InjectQueue(BullMqQuery.NONPROFIT_NEWS_QUEUE)
    private readonly newsQueue: Queue,
    private readonly taskSchedulerService: TaskSchedulerService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(newsRepository, 'nonprofit/news')
  }

  /**
   * Send news notification to all donated users
   * @param news NewsEntity
   * @returns Promise<void>
   **/
  sendNewsNotification = async (news: NewsEntity, nonprofitId: string): Promise<void> => {
    interface NotificationContent {
      title: string
      type: NotificationType
      receiver_type: NotificationReceiverType
      related_to: NotificationRelatedTo
      data: {
        nonprofitId: string
        resource: string
        title: string
      }
      user?: string
    }
    const notificationContent: NotificationContent = {
      title: news.title,
      type: NotificationType.NONPROFIT_ADD_NEWS,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.NONPROFIT,
      data: {
        nonprofitId,
        resource: news.id,
        title: news.title,
      },
    }

    const donatedUsers = await this.newsRepository.query(GetNonprofitDonatedUserQuery(nonprofitId))

    if (donatedUsers.length) {
      for (const user of donatedUsers) {
        await this.notificationsService.create({
          ...notificationContent,
          user: user.id,
        })
      }
    }
  }

  /**
   * Get nonprofit user from news id
   * @param newsId string
   * @returns Promise<string>
   * */
  getNonprofitUserIdByNewsId = async (newsId: string): Promise<string> => {
    const news = await this.findOne({
      where: { id: newsId },
      relations: ['user'],
      select: ['id'],
    })

    if (!news) {
      throw new NotFoundException('News not found')
    }

    return news.user.id
  }

  create = createService.bind(this)
  updateNews = updateNewsService.bind(this)
}
