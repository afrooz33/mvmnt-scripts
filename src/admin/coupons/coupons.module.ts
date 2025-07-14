import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'
import { BullMqQuery } from '@app/src/shared/constant'
import { IsLanguageActiveConstraint } from '@app/src/shared/validations'
import { LanguagesModule } from '@app/src/admin/languages/languages.module'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { CouponProcessor } from './processor'
import { CouponsController } from './coupons.controller'
import { CouponsService } from './coupons.service'
import { CouponsEntity } from './entities/coupons.entity'
import { CouponDealEntity } from './entities/coupon-deal.entity'
import { CouponsSubscriber } from './entities/coupons.subscriber'
import { CouponTranslationEntity } from './entities/coupons.translation.entity'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { CouponUserSearchConditionsEntity } from './entities/coupon-user-search-conditions.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponsEntity,
      CouponDealEntity,
      DealCategoryEntity,
      CouponTranslationEntity,
      CouponUserSearchConditionsEntity,
    ]),
    LanguagesModule,
    BullModule.registerQueue({
      name: BullMqQuery.ADMIN_COUPONS_QUEUE,
    }),
    TaskSchedulerModule,
  ],
  controllers: [CouponsController],
  providers: [CouponsService, IsLanguageActiveConstraint, CouponProcessor, CouponsSubscriber],
  exports: [CouponsService],
})
export class CouponsModule {}
