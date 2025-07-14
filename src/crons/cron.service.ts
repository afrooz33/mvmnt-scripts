// import { Cron } from '@nestjs/schedule'
import { Injectable, Logger } from '@nestjs/common'
// import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { GradesService } from '@app/src/users/grades/grades.service'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { ExecuteRecurringService } from '@app/src/recurring-donations/services'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { NonprofitFundsService } from '@app/src/nonprofit/funds/nonprofit-funds.service'
import { UserWithdrawalService } from '@app/src/users/withdrawal/user-withdrawal.service'
// import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { RevertExpiredPayments } from '@app/src/users/payment/modules/revert/services/revert-payments.service'

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name)

  constructor(
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly nonprofitFundsService: NonprofitFundsService,
    private readonly userWithdrawalService: UserWithdrawalService,
    private readonly userDonationsService: UserDonationsService,
    private readonly revertExpiredPaymentService: RevertExpiredPayments,
    private readonly userPointsService: UserPointsService,
    private readonly executeRecurringService: ExecuteRecurringService,
    private readonly gradesService: GradesService,
  ) {}

  // @Cron('0 0 0 * * *')
  // async unblockUser() {
  //   const users: NonprofitUserEntity[] = await this.nonprofitUserService.getBlockedUsers()

  //   await Promise.all(
  //     users.map(async (user: NonprofitUserEntity) => {
  //       user.account_status = AccountStatus.ACTIVE
  //       user.blocked_details = null

  //       await this.nonprofitUserService.updateOne(user)
  //     }),
  //   )
  // }

  // @Cron('*/5 * * * *')
  // async settleNonprofitFunds() {
  //   console.log('CRON: START: Settle Nonprofit Funds')
  //   await this.nonprofitFundsService.settleFunds()
  //   console.log('CRON: END: Settle Nonprofit Funds')
  // }

  // @Cron('0 0 * * *')
  // async unlockWithdrawals() {
  //   console.log('CRON: START: Unlock Withdrawals')
  //   await this.userWithdrawalService.unlockWithdrawals()
  //   console.log('CRON: END: Unlock Withdrawals')
  // }

  // @Cron('*/1 * * * *')
  // async revertDonationPayments() {
  //   console.log('CRON: START: Revert Expired Donations')
  //   await this.userDonationsService.revertExpiredDonations()
  //   console.log('CRON: END: Revert Expired Donations')
  // }

  // @Cron('*/1 * * * *')
  // async revertDealPayments() {
  //   console.log('CRON: START: Revert Deal Payments')
  //   await this.revertExpiredPaymentService.revertExpiredPayments()
  //   console.log('CRON: END: Revert Deal Payments')
  // }

  // @Cron('*/1 * * * *')
  // async revertWithdrawalRequests() {
  //   console.log('CRON: START: Revert Withdrawal Requests')
  //   await this.userWithdrawalService.revertWithdrawals()
  //   console.log('CRON: END: Revert Withdrawal Requests')
  // }

  // @Cron('0 0 * * *')
  // async deliverPoints() {
  //   console.log('CRON: START: Deliver Points')
  //   await this.userPointsService.deliverPoints()
  //   console.log('CRON: END: Deliver Points')
  // }

  // @Cron('0 0 * * *')
  // async expirePoints() {
  //   console.log('CRON: START: Expire Points')
  //   await this.userPointsService.expirePoints()
  //   console.log('CRON: END: Expire Points')
  // }

  // @Cron('*/2 * * * *')
  // async executeRecurring() {
  //   console.log('CRON: START: Execute Recurring Donation')
  //   await this.executeRecurringService.executeRecurringDonation()
  //   console.log('CRON: END: Execute Recurring Donation')
  // }

  //   @Cron('0 0 1 * * ')
  //   async updateGrades() {
  //     console.log('CRON: START: Update Grades')
  //     await this.gradesService.updateGrades()
  //     console.log('CRON: END: Update Grades')
  //   }
}
