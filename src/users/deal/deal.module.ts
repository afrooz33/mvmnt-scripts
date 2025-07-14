import { BullModule } from '@nestjs/bullmq'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { BullMqQuery } from '@app/src/shared/constant'
import {
  IsBrandAvailableConstraint,
  IsValidDealOptionConstraint,
  IsNonprofitUserAvailableConstraint,
  IsDealCategoryAvailableConstraint,
  IsDonationProjectAvailableConstraint,
  IsValidDealOptionColorValueConstraint,
} from '@app/src/shared/validations'
import { UserModule } from '@app/src/users/user/user.module'
import { ImagesModule } from '@app/src/images/images.module'
import { BrandsModule } from '@app/src/admin/brands/brands.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { ShippingMethodsModule } from '@app/src/admin/shipping-methods/shipping-methods.module'
import { ProductTagModule } from '@app/src/users/delivery-settings/product-tag/product-tag.module'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { BidModule } from './bid/bid.module'
import { DealCategoryModule } from './category/category.module'
import { RecentlyViewedModule } from './recently-viewed/recently-viewed.module'
import { UpdateNoteModule } from './update-note/update-note.module'
import { LikeModule } from './like/like.module'
import { RafflePurchaseModule } from './raffle-purchase/raffle-purchase.module'
import { BuynowModule } from './buynow/buynow.module'
import { TemplateModule as DealTemplateModule } from './template/template.module'
import { TemplateModule as DealShippingFeeTemplateModule } from './shipping-fee-template/template.module'
import { ReportModule } from './report/report.module'
import { DealController } from './deal.controller'
import { DealService } from './deal.service'
import { DealVariantOptionValueService } from './deal-variant-option-value.service'
import { DealEntity } from './entities/deal.entity'
import { DealRaffleEntity } from './entities/deal-raffle.entity'
import { DealOptionEntity } from './entities/deal-option.entity'
import { DealVariantEntity } from './entities/deal-variant.entity'
import { DealRafflePrizeEntity } from './entities/deal-raffle-prize.entity'
import { DealOptionValueEntity } from './entities/deal-option-value.entity'
import { DealShippingFeeEntity } from './entities/deal-shipping-fee.entity'
import { VariantOptionModule } from './variant-option/variant-option.module'
import { DealReviewModule } from './review/review.module'
import { MailModule } from '@app/src/mail/mail.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { DealVariantInventoryEntity } from './entities/deal-variant-inventory.entity'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { RestrictionsModule } from '@app/src/users/restrictions/restrictions.module'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { DealOptionService } from './deal-option.service'
import { DealProcessor } from './processor'
import { ShowOneDealService } from './services/showOne.service'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DealEntity,
      DealRaffleEntity,
      DealOptionEntity,
      DealVariantEntity,
      DealRafflePrizeEntity,
      ShippingProfileEntity,
      DealOptionValueEntity,
      DealShippingFeeEntity,
      DonationProjectEntity,
      DealVariantInventoryEntity,
    ]),
    EventEmitterModule.forRoot(),
    ImagesModule,
    BrandsModule,
    RecentlyViewedModule,
    UpdateNoteModule,
    forwardRef(() => LikeModule),
    DealCategoryModule,
    ShippingMethodsModule,
    forwardRef(() => DonationProjectsModule),
    forwardRef(() => NonprofitUserModule),
    DealTemplateModule,
    DealShippingFeeTemplateModule,
    BidModule,
    RafflePurchaseModule,
    BuynowModule,
    VariantOptionModule,
    UserModule,
    ReportModule,
    DealReviewModule,
    BullModule.registerQueue({
      name: BullMqQuery.USER_DEAL_QUEUE,
    }),
    TaskSchedulerModule,
    RestrictionsModule,
    MailModule,
    RegionSettingsModule,
    ProductTagModule,
    SystemFeeModule,
    CacheModule.register({
      ttl: 3600,
      max: 100,
    }),
    TokensModule,
    UserPointsModule,
  ],
  controllers: [DealController],
  providers: [
    DealService,
    DealProcessor,
    DealOptionService,
    ShowOneDealService,
    IsBrandAvailableConstraint,
    IsValidDealOptionConstraint,
    DealVariantOptionValueService,
    IsNonprofitUserAvailableConstraint,
    IsDealCategoryAvailableConstraint,
    IsDonationProjectAvailableConstraint,
    IsValidDealOptionColorValueConstraint,
  ],
  exports: [DealService, DealVariantOptionValueService, ShowOneDealService],
})
export class DealModule {}
