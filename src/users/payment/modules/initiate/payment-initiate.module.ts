import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { StarsModule } from '@app/src/users/stars/stars.module'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { ShippingModule } from '@app/src/sales-history/shipping/shipping.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { CryptoConversionService, UserPaymentHelper } from '@app/src/users/payment/services'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'
import { PaymentInitiateService } from './payment-initiate.service'
import { PaymentInitiateController } from './payment-initiate.controller'
import {
  InitiateRafflePaymentService,
  InitiateBuynowPaymentService,
  InitiateAuctionPaymentService,
} from './services'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      DealEntity,
      UserEntity,
      BuynowCartEntity,
      UserPointsEntity,
      UserDonationsEntity,
      ResellingLinkEntity,
      RafflePurchaseEntity,
      UserDealPaymentEntity,
      UserDealItemPaymentEntity,
    ]),
    ConfigModule,
    StarsModule,
    TokensModule,
    ShippingModule,
    SystemFeeModule,
    UserPointsModule,
    BlockchainModule,
    PaymentMethodModule,
    RegionSettingsModule,
  ],
  providers: [
    PaymentInitiateService,
    InitiateRafflePaymentService,
    InitiateBuynowPaymentService,
    InitiateAuctionPaymentService,
    UserPaymentHelper,
    CryptoConversionService,
    CoinMarketCapService,
  ],
  exports: [
    InitiateRafflePaymentService,
    InitiateBuynowPaymentService,
    InitiateAuctionPaymentService,
  ],
  controllers: [PaymentInitiateController],
})
export class PaymentInitiateModule {}
