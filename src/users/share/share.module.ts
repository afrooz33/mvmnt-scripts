import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShareController } from './share.controller'
import { DealShareService } from './deal/deal-share.service'
import { DealShareEntity } from './deal/entities/deal-share.entity'
import { NonprofitShareService } from './nonprofit/nonprofit-share.service'
import { NonprofitShareEntity } from './nonprofit/entities/nonprofit-share.entity'
import { DonationProjectShareService } from './donation-project/donation-project-share.service'
import { DonationProjectShareEntity } from './donation-project/entities/donation-project-share.entity'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { IsUserDonationProjectConstraint } from '@app/src/shared/validations'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { UserModule } from '@app/src/users/user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([DealShareEntity, DonationProjectShareEntity, NonprofitShareEntity]),
    DonationProjectsModule,
    NotificationsModule,
    DealModule,
    UserModule,
    NonprofitUserModule,
  ],
  controllers: [ShareController],
  providers: [
    DealShareService,
    DonationProjectShareService,
    NonprofitShareService,
    IsUserDonationProjectConstraint,
  ],
})
export class ShareModule {}
