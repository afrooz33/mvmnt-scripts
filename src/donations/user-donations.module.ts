import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserDonationsEntity } from './entities/donations.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { UserDonationsController } from './user-donations.controller'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { ConfigModule } from '@nestjs/config'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserPointsEntity,
      UserDonationsEntity,
      DonationProjectEntity,
      UserDonationPaymentEntity,
      RecurringDonationSettingsEntity,
      RecurringDonationSignaturesEntity,
      UserDealItemPaymentEntity,
      NotificationEntity,
    ]),
    UserPointsModule,
    BlockchainModule,
    SystemFeeModule,
    TokensModule,
    ConfigModule,
    PaymentMethodModule,
  ],
  providers: [UserDonationsService, CoinMarketCapService, SubgraphStrategy],
  exports: [UserDonationsService],
  controllers: [UserDonationsController],
})
export class UserDonationsModule {}
