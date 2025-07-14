import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { OrderRoutingEntity } from './entities/order-routing.entity'
import { OrderRoutingController } from './order-routing.controller'
import { OrderRoutingService } from './order-routing.service'
import { OrderRoutinShippingOriginEntity } from './entities/order-routing-shipping-origins.entity'
import { OrderRoutinShippingOriginGroupEntity } from './entities/order-routing-shipping-origin-groups.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderRoutingEntity,
      DealVariantInventoryEntity,
      OrderRoutinShippingOriginEntity,
      OrderRoutinShippingOriginGroupEntity,
    ]),
    UserModule,
    AddressModule,
  ],
  controllers: [OrderRoutingController],
  providers: [OrderRoutingService],
  exports: [OrderRoutingService],
})
export class OrderRoutingModule {}
