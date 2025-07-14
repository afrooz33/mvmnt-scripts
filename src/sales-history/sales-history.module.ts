import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { OrderCancellationEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation.entity'
import { OrderReturnExchangeEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange.entity'
import { OrderCancellationItemEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-item.entity'
import { OrderReturnExchangeItemEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-item.entity'
import { ShippingModule } from './shipping/shipping.module'
import { SalesHistoryController } from './sales-history.controller'
import { SalesHistoryService } from './sales-history.service'
import { CancelOrderModule } from './cancel-order/cancel-order.module'
import { ContactRequestsModule } from './contact-requests/contact-requests.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserDealPaymentEntity,
      OrderCancellationEntity,
      OrderCancellationItemEntity,
      OrderReturnExchangeEntity,
      OrderReturnExchangeItemEntity,
    ]),
    ShippingModule,
    CancelOrderModule,
    ContactRequestsModule,
  ],
  controllers: [SalesHistoryController],
  providers: [SalesHistoryService],
})
export class SalesHistoryModule {}
