import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderCancellationService } from './order-cancellation.service'
import { OrderCancellationController } from './order-cancellation.controller'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { OrderCancellationEntity } from './entities/order-cancellation.entity'
import { OrderCancellationLogEntity } from './entities/order-cancellation-log.entity'
import { OrderCancellationItemEntity } from './entities/order-cancellation-item.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      UserEntity,
      DealEntity,
      BuynowCartEntity,
      BuynowCartItemEntity,
      OrderCancellationEntity,
      OrderCancellationItemEntity,
      OrderCancellationLogEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [OrderCancellationController],
  providers: [OrderCancellationService],
  exports: [OrderCancellationService],
})
export class OrderCancellationModule {}
