import { Module } from '@nestjs/common'
import { ContactSellerModule } from './contact-seller/contact-seller.module'
import { ReturnExchangeModule } from './refund-exchange/refund-exchange.module'
import { OrderCancellationModule } from './cancel-order/order-cancellation.module'

@Module({
  imports: [ReturnExchangeModule, OrderCancellationModule, ContactSellerModule],
})
export class PurchaseHistoryModule {}
