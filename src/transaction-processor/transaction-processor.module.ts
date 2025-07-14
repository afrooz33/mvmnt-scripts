import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { BullMqQuery } from '@app/src/shared/constant'
import { RankModule } from '@app/src/users/rank/rank.module'
import { UserDonationsModule } from '@app/src/donations/user-donations.module'
import { UserWithdrawalModule } from '@app/src/users/withdrawal/user-withdrawal.module'
import { TokensModule as AdminTokensModule } from '@app/src/admin/tokens/tokens.module'
import { NonprofitFundsEntity } from '@app/src/nonprofit/funds/entities/nonprofit-funds.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { PaymentConfirmModule } from '@app/src/users/payment/modules/confirm/payment-confirm.module'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { TransactionProcessorRepository } from './repository'
import { WalletBalanceEntity } from './entities/wallet-balance.entity'
import { TransactionProcessorService } from './transaction-processor.service'
import { TransactionProcessorScheduler } from './transaction-processor.scheduler'
import { TransactionProcessor } from './processor/transaction-processor.processor'
import { TransactionProcessorController } from './transaction-processor.controller'
import { TransactionProcessLogEntity } from './entities/transaction-process-log.entity'

// New Necessary Imports
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { NonprofitFundsModule } from '@app/src/nonprofit/funds/nonprofit-funds.module'
import { RecurringDonationsModule } from '@app/src/recurring-donations/recurring-donations.module'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { UserWithdrawalRequestModule } from '@app/src/users/withdrawal/modules/request/user-withdrawal-request.module'
import { UserWithdrawalConcludeModule } from '@app/src/users/withdrawal/modules/conclude/user-withdrawal-conclude.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletBalanceEntity,
      PaymentWalletsEntity,
      UserWithdrawalEntity,
      NonprofitFundsEntity,
      UserDealPaymentEntity,
      UserDonationPaymentEntity,
      TransactionProcessLogEntity,
    ]),
    BullModule.registerQueue({
      name: BullMqQuery.TRANSACTION_PROCESSING_QUEUE,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule,
    RankModule,
    UserPointsModule,
    AdminTokensModule,
    UserDonationsModule,
    PaymentConfirmModule,
    NonprofitFundsModule,
    UserWithdrawalModule,
    DonationProjectsModule,
    RecurringDonationsModule,
    UserWithdrawalRequestModule,
    UserWithdrawalConcludeModule,
  ],
  controllers: [TransactionProcessorController],
  providers: [
    TransactionProcessor,
    TransactionProcessorService,
    TransactionProcessorScheduler,
    TransactionProcessorRepository,
  ],
  exports: [TransactionProcessorService],
})
export class TransactionProcessorModule {}
