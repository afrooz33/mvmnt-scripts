import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullMqQuery } from '@app/src/shared/constant'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { NewsController } from './news.controller'
import { NewsService } from './news.service'
import { NewsEntity } from './entities/news.entity'
import { NewsProcessor } from './processor'

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsEntity]),
    BullModule.registerQueue({
      name: BullMqQuery.NONPROFIT_NEWS_QUEUE,
    }),
    TaskSchedulerModule,
    NonprofitUserModule,
    NotificationsModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsProcessor],
})
export class NewsModule {}
