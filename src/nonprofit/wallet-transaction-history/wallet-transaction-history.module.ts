import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { WalletTransactionHistoryEntity } from '@app/src/users/wallet-transaction-history/entities/wallet-transaction-history.entity'
import { WalletTransactionHistoryService } from './wallet-transaction-history.service'
import { WalletTransactionHistoryController } from './wallet-transaction-history.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletTransactionHistoryEntity, PaymentWalletsEntity]),
    TokensModule,
  ],
  controllers: [WalletTransactionHistoryController],
  providers: [WalletTransactionHistoryService],
})
export class WalletTransactionHistoryModule {}
