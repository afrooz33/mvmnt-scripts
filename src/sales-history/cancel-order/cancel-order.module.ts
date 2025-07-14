import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderCancellationEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation.entity'
import { OrderCancellationLogEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-log.entity'
import { OrderCancellationItemEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-item.entity'
import { CancelOrderService } from './cancel-order.service'
import { CancelOrderController } from './cancel-order.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderCancellationEntity,
      OrderCancellationItemEntity,
      OrderCancellationLogEntity,
      BuynowCartEntity,
      BuynowCartItemEntity,
      BidEntity,
      UserEntity,
      DealEntity,
    ]),
  ],
  controllers: [CancelOrderController],
  providers: [CancelOrderService],
  exports: [CancelOrderService],
})
export class CancelOrderModule {}
