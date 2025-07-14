import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NonprofitFundsEntity } from './entities/nonprofit-funds.entity'
import { NonprofitFundsService } from './nonprofit-funds.service'
import { NonprofitFundsController } from './nonprofit-funds.controller'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { ConfigModule } from '@nestjs/config'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NonprofitFundsEntity,
      DonationProjectEntity,
      UserDealItemPaymentEntity,
      UserDonationsEntity,
    ]),
    TokensModule,
    BlockchainModule,
    ConfigModule,
  ],
  controllers: [NonprofitFundsController],
  providers: [NonprofitFundsService, SubgraphStrategy],
  exports: [NonprofitFundsService],
})
export class NonprofitFundsModule {}
