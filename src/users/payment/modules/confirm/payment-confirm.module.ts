import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StarsModule } from '@app/src/users/stars/stars.module'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { CryptoConversionService } from '@app/src/users/payment/services'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { ShippingModule } from '@app/src/sales-history/shipping/shipping.module'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { OrderOriginReservationEntity } from '@app/src/sales-history/shipping/entities/order-origin-reservations.entity'
import { WalletTransactionHistoryModule } from '@app/src/users/wallet-transaction-history/wallet-transaction-history.module'
import { PaymentConfirmService } from './payment-confirm.service'
import { ConfirmPaymentHelper } from './helper/confirm-payment.helper'
import { PaymentConfirmController } from './payment-confirm.controller'
import {
  ConfirmRafflePaymentService,
  ConfirmBuynowPaymentService,
  ConfirmAuctionPaymentService,
} from './services'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      UserPointsEntity,
      BuynowCartEntity,
      NotificationEntity,
      RafflePurchaseEntity,
      TokenWhitelistEntity,
      UserDealPaymentEntity,
      UserPointUpdatesEntity,
      UserDealItemPaymentEntity,
      DealVariantInventoryEntity,
      OrderOriginReservationEntity,
    ]),
    StarsModule,
    ConfigModule,
    TokensModule,
    ShippingModule,
    BlockchainModule,
    UserPointsModule,
    WalletTransactionHistoryModule,
  ],
  providers: [
    ConfirmPaymentHelper,
    PaymentConfirmService,
    CoinMarketCapService,
    CryptoConversionService,
    ConfirmRafflePaymentService,
    ConfirmBuynowPaymentService,
    ConfirmAuctionPaymentService,
  ],
  controllers: [PaymentConfirmController],
  exports: [PaymentConfirmService],
})
export class PaymentConfirmModule {}
