import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TransactionProcessorService } from './transaction-processor.service'

@Injectable()
export class TransactionProcessorScheduler {
  private readonly logger = new Logger(TransactionProcessorScheduler.name)

  constructor(private readonly transactionService: TransactionProcessorService) {}

  // Existing job to verify pending transactions
  @Cron(CronExpression.EVERY_MINUTE)
  async handleTransactionCron() {
    this.logger.debug('Running scheduled transaction processing job')
    try {
      await this.transactionService.queuePendingTransactions()
    } catch (error) {
      this.logger.error('Error in transaction processing cron job', error.stack)
    }
  }

  // Daily job at midnight to update balances first, then ranks
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // async handleDailyWalletBalanceAndRankCron() {
  //   this.logger.log('[CRON] Starting daily wallet balance + rank update')
  //   try {
  //     await this.transactionService.updateAllWalletBalancesThenUpdateRanks()
  //     this.logger.log('[CRON] Finished daily wallet balance + rank update')
  //   } catch (error) {
  //     this.logger.error('Error in daily wallet balance + rank update cron job', error.stack)
  //   }
  // }
}
