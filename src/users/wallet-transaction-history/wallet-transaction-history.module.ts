import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { WalletTransactionHistoryService } from './wallet-transaction-history.service'
import { WalletTransactionHistoryEntity } from './entities/wallet-transaction-history.entity'
import { WalletTransactionHistoryController } from './wallet-transaction-history.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentWalletsEntity, WalletTransactionHistoryEntity]),
    UserModule,
    TokensModule,
  ],
  controllers: [WalletTransactionHistoryController],
  providers: [WalletTransactionHistoryService],
  exports: [WalletTransactionHistoryService],
})
export class WalletTransactionHistoryModule {}
