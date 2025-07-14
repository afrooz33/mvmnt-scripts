import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealModule } from '@app/src/users/deal/deal.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { ReturnExchangeService } from './refund-exchange.service'
import { ReturnExchangeController } from './refund-exchange.controller'
import { OrderReturnRefundEntity } from './entities/order-return-refunds.entity'
import { OrderReturnShipmentEntity } from './entities/order-return-shipment.entity'
import { OrderReturnExchangeEntity } from './entities/order-return-exchange.entity'
import { OrderReturnExchangeLogEntity } from './entities/order-return-exchange-log.entity'
import { OrderReturnExchangeItemEntity } from './entities/order-return-exchange-item.entity'

@Module({
  imports: [
    DealModule,
    AddressModule,
    BlockchainModule,
    TypeOrmModule.forFeature([
      BidEntity,
      BuynowCartEntity,
      BuynowCartItemEntity,
      UserDealPaymentEntity,
      UserDealItemPaymentEntity,
      OrderReturnRefundEntity,
      OrderReturnShipmentEntity,
      OrderReturnExchangeEntity,
      OrderReturnExchangeItemEntity,
      OrderReturnExchangeLogEntity,
    ]),
  ],
  controllers: [ReturnExchangeController],
  providers: [ReturnExchangeService],
  exports: [ReturnExchangeService],
})
export class ReturnExchangeModule {}
