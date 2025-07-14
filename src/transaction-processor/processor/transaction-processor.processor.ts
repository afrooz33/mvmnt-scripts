import { Job } from 'bullmq'
import { Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { BullMqQuery } from '@app/src/shared/constant'
import { TransactionProcessorService } from '@app/src/transaction-processor/transaction-processor.service'
import { SubgraphEvents } from '../enums'

@Processor(BullMqQuery.TRANSACTION_PROCESSING_QUEUE, { concurrency: 10 })
export class TransactionProcessor extends WorkerHost {
  private readonly logger = new Logger(TransactionProcessor.name)

  constructor(private readonly transactionService: TransactionProcessorService) {
    super()
  }

  async process(job: Job): Promise<void> {
    // Ensure eventType is passed and is a valid SubgraphEvents member
    const { transactionHash, logId, eventType } = job.data as {
      transactionHash: string
      logId: string
      eventType: SubgraphEvents
    }

    if (!eventType || !Object.values(SubgraphEvents).includes(eventType)) {
      this.logger.error(
        `Invalid or missing eventType for transaction ${transactionHash} in job ${
          job.id
        }. Data: ${JSON.stringify(job.data)}`,
      )
      // Fail the job explicitly if eventType is critical and missing/invalid
      throw new Error(`Invalid or missing eventType: ${eventType}`)
    }

    this.logger.log(
      `Processing event ${eventType} for transaction ${transactionHash} (Log ID: ${logId}), attempt ${
        job.attemptsMade + 1
      }`,
    )

    try {
      // Call the updated method in TransactionProcessorService
      const result = await this.transactionService.verifyAndProcessEvent(
        transactionHash,
        logId,
        eventType,
      )

      if (result) {
        this.logger.log(
          `Event ${eventType} for transaction ${transactionHash} processed successfully.`,
        )
        // No explicit return needed for BullMQ success
      } else {
        this.logger.warn(
          `Event ${eventType} for transaction ${transactionHash} could not be verified or found in subgraph. Job will follow retry logic.`,
        )
        // Throw an error to let BullMQ handle retries based on job options
        throw new Error(`Event ${eventType} not found or failed processing for ${transactionHash}`)
      }
    } catch (error) {
      this.logger.error(
        `Error processing event ${eventType} for transaction ${transactionHash}: ${error.message}`,
        error.stack,
      )
      throw error // Re-throw to ensure BullMQ handles failure and retries
    }
  }
}
