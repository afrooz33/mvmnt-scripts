import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullMqQuery } from '@app/src/shared/constant'
import { GeoModule } from '@app/src/admin/geo/geo.module'
import { UserModule } from '@app/src/users/user/user.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { BuynowModule } from '@app/src/users/deal/buynow/buynow.module'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { CouponsService } from './coupons.service'
import { CouponsController } from './coupons.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      CouponsEntity,
      RafflePurchaseEntity,
      UserDealPaymentEntity,
    ]),
    GeoModule,
    UserModule,
    DealModule,
    BuynowModule,
    TaskSchedulerModule,
    BullModule.registerQueue({
      name: BullMqQuery.ADMIN_COUPONS_QUEUE,
    }),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
