import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { Between, In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { BullMqQuery } from '@app/src/shared/constant'
import { DONATION_STATUS } from '@app/src/donations/enums/user-donations.enum'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'

@Injectable()
export class ReceiptSchedulerService {
  private readonly logger = new Logger(ReceiptSchedulerService.name)

  constructor(
    @InjectQueue(BullMqQuery.DONATION_RECEIPT_QUEUE)
    private readonly receiptsQueue: Queue,

    @InjectRepository(UserDonationsEntity)
    private readonly donationRepository: Repository<UserDonationsEntity>,
    private readonly taskSchedulerService: TaskSchedulerService,
  ) {}

  /**
   *Daily at 2am: process the entire batch from the 16th day
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduleReceiptProcessing() {
    this.logger.log('Scheduling daily 16-day receipt processing job...')

    try {
      const sixteenDaysAgo = new Date()
      sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16)

      const startOfDay = new Date(sixteenDaysAgo)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(sixteenDaysAgo)
      endOfDay.setHours(23, 59, 59, 999)

      const eligibleCount = await this.donationRepository.count({
        where: {
          status: In([DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED]),
          created: Between(startOfDay, endOfDay),
          receipt_sent: false,
        },
      })

      this.logger.log(`Found ${eligibleCount} donations from the entire 16th day.`)

      if (eligibleCount > 0) {
        const name = `Total Donation Receipts - ${eligibleCount}`

        const job = await this.receiptsQueue.add(
          'process-donation-receipts',
          { eligibleCount },
          {
            priority: 1,
            attempts: 3,
            backoff: { type: 'exponential', delay: 60000 },
            removeOnComplete: true,
          },
        )

        await this.taskSchedulerService.create({
          job_id: job.id,
          name,
          data: { eligibleCount },
          scheduled_at: startOfDay,
        })

        this.logger.log('Daily batch job enqueued.')
      } else {
        this.logger.log('No daily receipts to process today.')
      }
    } catch (error) {
      this.logger.error(`Error scheduling daily job: ${error.message}`, error.stack)
    }
  }

  /**
   * Every hour: handle "exact 16-day from purchase time" logic
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processExactTimedReceipts() {
    this.logger.log('Checking receipts for the EXACT 16-day mark (hourly)...')

    try {
      const now = new Date()
      const sixteenDaysAgo = new Date(now)
      sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16)

      const lowerBound = new Date(sixteenDaysAgo)
      lowerBound.setMinutes(lowerBound.getMinutes() - 30)

      const upperBound = new Date(sixteenDaysAgo)
      upperBound.setMinutes(upperBound.getMinutes() + 30)

      const name = `Exact 16-day Donation Receipts - ${lowerBound} - ${upperBound}`

      const job = await this.receiptsQueue.add(
        'process-exact-time-donation-receipts',
        { lowerBound, upperBound },
        {
          priority: 2,
          attempts: 3,
          removeOnComplete: true,
          backoff: { type: 'exponential', delay: 60000 },
        },
      )

      await this.taskSchedulerService.create({
        job_id: job.id,
        name,
        data: { lowerBound, upperBound },
        scheduled_at: lowerBound,
      })

      this.logger.log('Hourly exact-time job enqueued.')
    } catch (error) {
      this.logger.error(`Error scheduling exact-time job: ${error.message}`, error.stack)
    }
  }
}
