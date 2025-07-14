import { Module, forwardRef } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DonationProjectsController } from './donation-projects.controller'
import { DonationProjectsService } from './donation-projects.service'
import { DonationProjectEntity } from './entities/donation-project.entity'
import { ImagesModule } from '@app/src/images/images.module'
import { TagsModule } from '@app/src/admin/tags/tags.module'
import { NonprofitProfileModule } from '@app/src/nonprofit/profile/nonprofit-profile.module'
import { IsImageAvailableConstraint } from '@app/src/shared/validations'
import { MailModule } from '@app/src/mail/mail.module'
import { BullMqQuery } from '@app/src/shared/constant'
import { DealModule } from '@app/src/users/deal/deal.module'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { DonationProjectProcessor } from './processor'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    TypeOrmModule.forFeature([DonationProjectEntity, UserDonationsEntity]),
    BullModule.registerQueue({
      name: BullMqQuery.DONATION_PROJECT_QUEUE,
    }),
    ImagesModule,
    TagsModule,
    NonprofitProfileModule,
    MailModule,
    DealModule,
    TaskSchedulerModule,
    forwardRef(() => DonationsModule),
    NotificationsModule,
    ConfigModule,
  ],
  controllers: [DonationProjectsController],
  providers: [
    DonationProjectsService,
    IsImageAvailableConstraint,
    DonationProjectProcessor,
    SubgraphStrategy,
  ],
  exports: [DonationProjectsService],
})
export class DonationProjectsModule {}
