import { Module } from '@nestjs/common'
import { NewsModule } from './news/news.module'
import { PaymentModule } from './payment/payment.module'
import { ReceiptModule } from './receipt/receipt.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { NonprofitUserModule } from './user/nonprofit-user.module'
import { NonprofitAuthModule } from './auth/nonprofit-auth.module'
import { NonprofitProfileModule } from './profile/nonprofit-profile.module'
import { BankAccountsModule } from './bank-accounts/bank-accounts.module'
import { DonationProjectsModule } from './donation-projects/donation-projects.module'
import { NonprofitFundsModule } from './funds/nonprofit-funds.module'
import { WalletTransactionHistoryModule } from './wallet-transaction-history/wallet-transaction-history.module'

@Module({
  imports: [
    NewsModule,
    ReceiptModule,
    PaymentModule,
    AnalyticsModule,
    NonprofitAuthModule,
    BankAccountsModule,
    NonprofitUserModule,
    NonprofitFundsModule,
    NonprofitProfileModule,
    DonationProjectsModule,
    WalletTransactionHistoryModule,
  ],
})
export class NonprofitModule {}
