import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'
import { BullMqQuery } from '@app/src/shared/constant'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DonationsModule } from '@app/src/donations/donations.module'
import { DealReviewModule } from '@app/src/users/deal/review/review.module'
import { VariantOptionModule } from './variant-option/variant-option.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { DealRaffleEntity } from '@app/src/users/deal/entities/deal-raffle.entity'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { RecurringDonationsModule } from '@app/src/recurring-donations/recurring-donations.module'
import { RaffleWinnerEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-winner.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { DealService } from './deal.service'
import { DealController } from './deal.controller'
import { DealCategoryModule } from './category/category.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DealEntity,
      DealRaffleEntity,
      DealVariantEntity,
      RaffleWinnerEntity,
      RafflePurchaseEntity,
      ShippingProfileEntity,
      UserDealPaymentEntity,
      UserDealItemPaymentEntity,
    ]),
    DealCategoryModule,
    VariantOptionModule,
    SystemFeeModule,
    DonationsModule,
    NotificationsModule,
    DealReviewModule,
    TaskSchedulerModule,
    BullModule.registerQueue({
      name: BullMqQuery.USER_DEAL_QUEUE,
    }),
    RecurringDonationsModule,
  ],
  controllers: [DealController],
  providers: [DealService],
})
export class DealModule {}
