import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, ILike, In } from 'typeorm'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { ErrorKey } from '@app/src/shared/enums'
import { BullMqQuery } from '@app/src/shared/constant'
import { MailService } from '@app/src/mail/mail.service'
import { ReceiptsService } from '@app/src/users/receipts/receipts.service'
import { DONATION_STATUS } from '@app/src/donations/enums/user-donations.enum'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums/task-schedule-status.enum'

@Processor(BullMqQuery.DONATION_RECEIPT_QUEUE)
export class ReceiptProcessor extends WorkerHost {
  private readonly logger = new Logger(ReceiptProcessor.name)

  private readonly BATCH_SIZE = 100

  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly donationRepository: Repository<UserDonationsEntity>,
    private readonly emailService: MailService,
    private readonly receiptsService: ReceiptsService,
    private readonly taskSchedulerService: TaskSchedulerService,
  ) {
    super()
  }

  async process(job: Job<any>): Promise<any> {
    const task = await this.taskSchedulerService.documentExists({
      condition: [
        {
          where: {
            job_id: job.id,
            name: ILike('%Donation Receipts%'),
          },
        },
      ],
      errorMessage: ErrorKey.TASK_SCHEDULER_NOT_FOUND,
    })

    try {
      switch (job.name) {
        case 'process-donation-receipts':
          await this.handleProcessReceipts(job)

        case 'process-exact-time-donation-receipts':
          await this.handleProcessExactTimeReceipts(job)

        default:
          this.logger.warn(`No matching handler for job name: ${job.name}`)
      }

      task.status = TaskScheduleStatus.COMPLETED
      await task.save()

      return job
    } catch (error) {
      task.status = TaskScheduleStatus.FAILED
      task.error = error.message || String(error)

      await task.save()

      this.logger.error(`Job ${job.name} failed: ${error.message}`, error.stack)
      throw error
    }
  }

  private async handleProcessReceipts(job: Job<any>): Promise<{ processed: number }> {
    this.logger.log('Starting to process receipts for 16-day mark (daily batch)')

    let processedCount = 0
    let hasMoreBatches = true
    let offset = 0

    while (hasMoreBatches) {
      const eligibleDonations = await this.fetchEligibleDonations(offset)

      if (eligibleDonations.length === 0) {
        hasMoreBatches = false
        break
      }

      for (const donation of eligibleDonations) {
        await this.processSingleDonationReceipt(donation)
        processedCount++

        if (processedCount % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        if (processedCount % 50 === 0) {
          await job.updateProgress(processedCount)
        }
      }

      offset += this.BATCH_SIZE

      this.logger.log(`Processed ${processedCount} receipts so far...`)
    }

    this.logger.log(`Completed processing ${processedCount} receipts`)

    return { processed: processedCount }
  }

  /**
   * Handle the hourly "exact-time" job, which looks for donations
   * whose created timestamp is within (now - 16 days) ± 30 minutes
   */
  private async handleProcessExactTimeReceipts(
    job: Job<{ lowerBound: Date; upperBound: Date }>,
  ): Promise<{ processed: number }> {
    const { lowerBound, upperBound } = job.data

    this.logger.log(`Processing receipts for exact-time window: ${lowerBound} -- ${upperBound}`)

    const eligibleDonations = await this.donationRepository.find({
      where: {
        status: In([DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED]),
        created: Between(lowerBound, upperBound),
        receipt_sent: false,
      },
      select: ['id', 'created', 'receipt_sent'],
    })

    this.logger.log(`Found ${eligibleDonations.length} donations for exact-time processing`)

    let processedCount = 0

    for (const donation of eligibleDonations) {
      await this.processSingleDonationReceipt(donation)

      processedCount++

      if (processedCount % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    this.logger.log(`Exact-time job processed ${processedCount} donations`)

    return { processed: processedCount }
  }

  /**
   * Query for donations that were created on the date exactly 16 days ago (00:00 - 23:59)
   * and have not yet been sent a receipt.
   */
  private async fetchEligibleDonations(offset: number): Promise<UserDonationsEntity[]> {
    const sixteenDaysAgo = new Date()
    sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16)

    const startOfDay = new Date(sixteenDaysAgo)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(sixteenDaysAgo)
    endOfDay.setHours(23, 59, 59, 999)

    return this.donationRepository
      .createQueryBuilder('donation')
      .where('donation.status = :status', { status: DONATION_STATUS.COMPLETED })
      .andWhere('donation.created BETWEEN :startDate AND :endDate', {
        startDate: startOfDay,
        endDate: endOfDay,
      })
      .select(['donation.id', 'donation.created', 'donation.receipt_sent'])
      .andWhere('donation.receipt_sent = :sent', { sent: false })
      .orderBy('donation.created', 'ASC')
      .skip(offset)
      .take(this.BATCH_SIZE)
      .getMany()
  }

  /**
   * The core logic of generating the receipt data, sending the email,
   * and marking the donation as "receipt_sent = true".
   */
  private async processSingleDonationReceipt(donation: UserDonationsEntity) {
    try {
      // 1. Gather data (e.g. merging donation, nonprofit info, user info, etc.)
      const receiptData = await this.receiptsService.showOne(donation.id)

      if (!receiptData) {
        this.logger.warn(`No receipt data found for donation ${donation.id}`)
        return
      }

      // 2. Send the email
      await this.emailService.donationReceipt({
        username: receiptData.username,
        email: receiptData.email,
        data: receiptData,
      })

      // 3. Mark as sent
      await this.donationRepository.update(
        { id: donation.id },
        {
          receipt_sent: true,
          receipt_sent_at: new Date(),
        },
      )

      this.logger.debug(`Successfully processed receipt for donation ${donation.id}`)
    } catch (error) {
      this.logger.error(
        `Failed to process receipt for donation ${donation.id}: ${error.message}`,
        error.stack,
      )

      throw error
    }
  }
}
