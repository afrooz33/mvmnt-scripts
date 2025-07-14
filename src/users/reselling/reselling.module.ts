import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { ResellingService } from './reselling.service'
import { ResellingController } from './reselling.controller'
import { ResellingLinkEntity } from './entities/reselling.entity'
import { ResellingRewardService } from './reselling-reward.service'
import { ResellingEventEntity } from './entities/reselling-event.entity'
import { ResellingRewardEntity } from './entities/reselling-reward.entity'
import { ResellingRewardMemoEntity } from './entities/reselling-reward-memo.entity'
import { ResellingBannedUserEntity } from './entities/reselling-banned-user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DealEntity,
      ResellingLinkEntity,
      ResellingEventEntity,
      ResellingRewardEntity,
      ResellingBannedUserEntity,
      ResellingRewardMemoEntity,
      UserDealItemPaymentEntity,
    ]),
    ConfigModule,
  ],
  controllers: [ResellingController],
  providers: [ResellingService, ResellingRewardService],
  exports: [ResellingService, ResellingRewardService],
})
export class ResellingModule {}
