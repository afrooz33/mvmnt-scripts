import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { CouponsModule } from '@app/src/coupons/coupons.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { ShippingModule } from '@app/src/sales-history/shipping/shipping.module'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { OrderRoutingModule } from '@app/src/users/order-routing/order-routing.module'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { ShippingProfilesModule } from '@app/src/users/shipping-profiles/shipping-profiles.module'
import { DeliverySettingsModule } from '@app/src/users/delivery-settings/delivery-settings.module'
import { CheckoutController } from './checkout.controller'
import { CheckoutService } from './checkout.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([BuynowCartEntity, BuynowCartItemEntity]),
    UserModule,
    AddressModule,
    CouponsModule,
    ShippingModule,
    SystemFeeModule,
    OrderRoutingModule,
    ShippingProfilesModule,
    DeliverySettingsModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
