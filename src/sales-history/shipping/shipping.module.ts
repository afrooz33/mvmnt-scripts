import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { UserModule } from '@app/src/users/user/user.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { BuynowModule } from '@app/src/users/deal/buynow/buynow.module'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { OrderRoutingModule } from '@app/src/users/order-routing/order-routing.module'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { DeliveryCarrierEntity } from '@app/src/users/delivery-settings/carrier/entities/delivery-carrier.entity'
import { ShippingService } from './shipping.service'
import { InventoryService } from './inventory.service'
import { ShippingController } from './shipping.controller'
import { OrderShippingEntity } from './entities/order-shipping.entity'
import { OrderShippingItemEntity } from './entities/order-shipping-item.entity'
import { OrderShippingTrackingEntity } from './entities/order-shipping-tracking.entity'
import { OrderOriginReservationEntity } from './entities/order-origin-reservations.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      OrderShippingEntity,
      BuynowCartItemEntity,
      DeliveryCarrierEntity,
      OrderShippingItemEntity,
      DealVariantInventoryEntity,
      OrderShippingTrackingEntity,
      OrderOriginReservationEntity,
    ]),
    UserModule,
    AddressModule,
    OrderRoutingModule,
    forwardRef(() => BuynowModule),
  ],
  controllers: [ShippingController],
  providers: [ShippingService, InventoryService],
  exports: [ShippingService, InventoryService],
})
export class ShippingModule {}
