import { Module } from '@nestjs/common'
import { CronService } from '@app/src/crons/cron.service'
import { GradesModule } from '@app/src/users/grades/grades.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { UserDonationsModule } from '@app/src/donations/user-donations.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { NonprofitFundsModule } from '@app/src/nonprofit/funds/nonprofit-funds.module'
import { UserWithdrawalModule } from '@app/src/users/withdrawal/user-withdrawal.module'
import { PaymentRevertModule } from '@app/src/users/payment/modules/revert/revert-payment.module'
import { RecurringDonationsModule } from '@app/src/recurring-donations/recurring-donations.module'

@Module({
  imports: [
    GradesModule,
    UserPointsModule,
    NonprofitUserModule,
    UserDonationsModule,
    PaymentRevertModule,
    NonprofitFundsModule,
    UserWithdrawalModule,
    RecurringDonationsModule,
  ],
  providers: [CronService],
})
export class CronModule {}
