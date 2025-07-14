import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { DealModule } from '@app/src/users/deal/deal.module'
import { UserModule } from '@app/src/users/user/user.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { WishlistModule } from '@app/src/users/wishlist/wishlist.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { ShippingModule } from '@app/src/sales-history/shipping/shipping.module'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { ShippingProfilesModule } from '@app/src/users/shipping-profiles/shipping-profiles.module'
import { BuynowService } from './buynow.service'
import { BuynowController } from './buynow.controller'
import { BuynowCartEntity } from './entities/cart.entity'
import { BuynowCartItemEntity } from './entities/cart-item.entity'
import { MergeCartListener } from './listeners'

@Module({
  imports: [
    TypeOrmModule.forFeature([BuynowCartEntity, BuynowCartItemEntity]),
    forwardRef(() => DealModule),
    UserModule,
    NotificationsModule,
    SystemFeeModule,
    DonationsModule,
    RegionSettingsModule,
    WishlistModule,
    ShippingProfilesModule,
    forwardRef(() => ShippingModule),
  ],
  controllers: [BuynowController],
  providers: [BuynowService, MergeCartListener],
  exports: [BuynowService],
})
export class BuynowModule {}
