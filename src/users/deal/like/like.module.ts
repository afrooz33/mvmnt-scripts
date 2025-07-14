import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { IsUserDealConstraint } from '@app/src/shared/validations'
import { LikeController } from './like.controller'
import { LikeService } from './like.service'
import { LikeEntity } from './entities/like.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([LikeEntity]),
    forwardRef(() => DealModule),
    NotificationsModule,
  ],
  controllers: [LikeController],
  providers: [LikeService, IsUserDealConstraint],
  exports: [LikeService],
})
export class LikeModule {}
