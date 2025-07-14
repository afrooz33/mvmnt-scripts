import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RevertPaymentController } from './revert-payment.controller'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { RevertPaymentService } from './revert-payment.service'
import {
  RevertPaymentBuynowService,
  RevertPaymentRaffleService,
  RevertPaymentAuctionService,
  RevertExpiredPayments,
} from './services'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { UserDonationsModule } from '@app/src/donations/user-donations.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserDealPaymentEntity,
      UserDealItemPaymentEntity,
      BuynowCartEntity,
      BuynowCartItemEntity,
      DealEntity,
      RafflePurchaseEntity,
      NotificationEntity,
      UserEntity,
      BidEntity,
    ]),
    BlockchainModule,
    UserPointsModule,
    UserDonationsModule,
    ConfigModule,
  ],
  providers: [
    RevertPaymentService,
    RevertPaymentBuynowService,
    RevertPaymentRaffleService,
    RevertPaymentAuctionService,
    RevertExpiredPayments,
  ],
  exports: [RevertExpiredPayments],
  controllers: [RevertPaymentController],
})
export class PaymentRevertModule {}
