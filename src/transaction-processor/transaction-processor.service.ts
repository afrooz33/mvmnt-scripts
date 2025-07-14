import axios from 'axios'
import { Queue } from 'bullmq'
import { firstValueFrom } from 'rxjs'
import BigNumber from 'bignumber.js'
import { Repository } from 'typeorm'
import { HttpService } from '@nestjs/axios'
import { InjectQueue } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, Logger } from '@nestjs/common'
import { BullMqQuery } from '@app/src/shared/constant'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums/payment-status.enum'
import { UserWithdrawalService } from '@app/src/users/withdrawal/user-withdrawal.service'
import { TransactionProcessorRepository } from '@app/src/transaction-processor/repository'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { WalletBalanceEntity } from '@app/src/transaction-processor/entities/wallet-balance.entity'
import { PaymentConfirmService } from '@app/src/users/payment/modules/confirm/payment-confirm.service'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { PaymentMethodStatus } from '@app/src/users/payment-method/enums/payment-method-status.enum'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { UserWithdrawalRequestService } from '@app/src/users/withdrawal/modules/request/user-withdrawal-request.service'
import { UserWithdrawalConcludeService } from '@app/src/users/withdrawal/modules/conclude/user-withdrawal-conclude.service'
import { TransactionProcessLogEntity } from '@app/src/transaction-processor/entities/transaction-process-log.entity'
import { RankService } from '@app/src/users/rank/rank.service'
import { UpdateRanksDto } from '@app/src/users/rank/dto/update-ranks.dto'
import { SubgraphEvents, TransactionStatus } from './enums'
import {
  PaymentHandler,
  GraphQLDealPayment,
  GraphQLDonationPayment,
  GraphQLNonprofitWithdraw,
  GraphQLTokenStatusUpdated,
  GraphQLUserWithdrawInitiate,
  GraphQLUserWithdrawComplete,
  GraphQLUserWithdrawReverted,
  GraphQLNonprofitFundsSettled,
  GraphQLNonprofitFundsReceived,
  GraphQLNonprofitVaultDeployed,
  GraphQLRecurringDonationDeactivated,
} from './interfaces'

import { UserPointsService } from '@app/src/users/points/user-points.service'
import { NonprofitFundsService } from '@app/src/nonprofit/funds/nonprofit-funds.service'
import { RecurringDonationsService } from '@app/src/recurring-donations/recurring-donations.service'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'

@Injectable()
export class TransactionProcessorService {
  private readonly DELAY = 45000
  private readonly MAX_RETRIES = 3
  private readonly SUBGRAPH_URL = this.configService.getOrThrow('blockchain.subgraphUrl')
  private readonly logger = new Logger(TransactionProcessorService.name)

  private readonly eventHandlers: Record<SubgraphEvents, PaymentHandler>

  constructor(
    @InjectQueue(BullMqQuery.TRANSACTION_PROCESSING_QUEUE)
    private readonly transactionQueue: Queue,
    @InjectRepository(UserDealPaymentEntity)
    private userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDonationPaymentEntity)
    private userDonationPaymentRepository: Repository<UserDonationPaymentEntity>,
    @InjectRepository(TransactionProcessLogEntity)
    private processLogRepository: Repository<TransactionProcessLogEntity>,
    @InjectRepository(WalletBalanceEntity)
    private walletBalanceRepository: Repository<WalletBalanceEntity>,
    @InjectRepository(PaymentWalletsEntity)
    private paymentWalletsRepository: Repository<PaymentWalletsEntity>,
    private httpService: HttpService,
    private transactionRepository: TransactionProcessorRepository,
    private configService: ConfigService,
    private paymentConfirmService: PaymentConfirmService,
    private userDonationsService: UserDonationsService,
    private userWithdrawalRequestService: UserWithdrawalRequestService,
    private userWithdrawalConcludeService: UserWithdrawalConcludeService,
    private userWithdrawalService: UserWithdrawalService,
    private tokensService: TokensService,
    private readonly rankService: RankService,
    private donationProjectsService: DonationProjectsService,
    private nonprofitFundsService: NonprofitFundsService,
    private recurringDonationsService: RecurringDonationsService,
    private readonly userPointsService: UserPointsService,
  ) {
    this.eventHandlers = {
      [SubgraphEvents.dealPayment]: {
        queryName: 'productSolds',
        queryFragment: `
          id
          productId
          blockNumber
          paymentId
          transactionHash
        `,
        processEvent: async (eventData: GraphQLDealPayment) => {
          await this.paymentConfirmService.confirmPayment({
            payment_id: this.formatPaymentId(eventData.paymentId),
            timestamp: Date.now(),
          })
        },
      },
      [SubgraphEvents.directDonation]: {
        queryName: 'donationReceiveds',
        queryFragment: `
          paymentId
          transactionHash
          unsettledAmount
          donationType
        `,
        processEvent: async (eventData: GraphQLDonationPayment, transactionHash?: string) => {
          await this.userDonationsService.confirmDonation({
            payment_id: this.formatPaymentId(eventData.paymentId),
            transaction_hash: transactionHash || eventData.transactionHash,
            unsettled_amount: eventData.unsettledAmount.toString(),
            type: eventData.donationType,
            timestamp: Date.now(),
          })
        },
      },
      [SubgraphEvents.userWithdrawInitiate]: {
        queryName: 'userWithdrawInitiateds',
        queryFragment: `
          withdrawId
          unlockTime
          transactionHash
        `,
        processEvent: async (eventData: GraphQLUserWithdrawInitiate) => {
          await this.userWithdrawalRequestService.confirmRequest({
            withdraw_id: this.formatPaymentId(eventData.withdrawId),
            unlock_time: eventData.unlockTime,
            timestamp: Date.now(),
          })
        },
      },
      [SubgraphEvents.userWithdrawComplete]: {
        queryName: 'userWithdrawCompleteds',
        queryFragment: `
          withdrawId
          transactionHash
        `,
        processEvent: async (eventData: GraphQLUserWithdrawComplete) => {
          await this.userWithdrawalConcludeService.confirmConclude({
            withdraw_id: this.formatPaymentId(eventData.withdrawId),
            timestamp: Date.now(),
          })
        },
      },
      [SubgraphEvents.userWithdrawReverted]: {
        queryName: 'userWithdrawReverteds',
        queryFragment: `
          withdrawId
          transactionHash
        `,
        processEvent: async (eventData: GraphQLUserWithdrawReverted) => {
          await this.userWithdrawalService.rejectWithdrawal(
            this.formatPaymentId(eventData.withdrawId),
          )
        },
      },
      [SubgraphEvents.nonprofitWithdraw]: {
        queryName: 'withdrawns',
        queryFragment: `
          token
          withdrawer
          amount
          transactionHash
        `,
        processEvent: async (eventData: GraphQLNonprofitWithdraw) => {
          this.logger.log(`Processing nonprofitWithdraw: ${JSON.stringify(eventData)}`)
          await this.nonprofitFundsService.fundsWithdrawn({
            timestamp: Date.now(),
            token: eventData.token,
            donation_project: eventData.withdrawer,
          })
        },
      },
      [SubgraphEvents.nonprofitFundsReceived]: {
        queryName: 'donationReceiveds',
        queryFragment: `
          token
          nonprofitVault
          amount
          donationType
          transactionHash
        `,
        processEvent: async (eventData: GraphQLNonprofitFundsReceived) => {
          this.logger.log(`Processing nonprofitFundsReceived: ${JSON.stringify(eventData)}`)
          await this.nonprofitFundsService.fundsReceived({
            timestamp: Date.now(),
            token: eventData.token,
            donation_project: eventData.nonprofitVault,
          })
        },
      },
      [SubgraphEvents.nonprofitFundsSettled]: {
        queryName: 'donationSettleds',
        queryFragment: `
          id
          token
          amount
          transactionHash
        `,
        processEvent: async (eventData: GraphQLNonprofitFundsSettled) => {
          this.logger.log(`Processing nonprofitFundsSettled: ${JSON.stringify(eventData)}`)
          await this.nonprofitFundsService.fundsSettled({
            donation_project: eventData.id,
            token: eventData.token,
            timestamp: Date.now(),
          })
        },
      },
      [SubgraphEvents.nonprofitVaultDeployed]: {
        queryName: 'nonprofitVaultDeployeds',
        queryFragment: `
          projectId
          nonprofitVault
          transactionHash
        `,
        processEvent: async (eventData: GraphQLNonprofitVaultDeployed) => {
          await this.donationProjectsService.updateVault({
            project_id: eventData.projectId,
            vault_address: eventData.nonprofitVault,
            timestamp: Date.now(),
          })
        },
      },
      [SubgraphEvents.tokenStatusUpdated]: {
        queryName: 'tokenStatusUpdateds',
        queryFragment: `
          token
          status
          transactionHash
        `,
        processEvent: async (eventData: GraphQLTokenStatusUpdated) => {
          this.logger.log(`Processing tokenStatusUpdated: ${JSON.stringify(eventData)}`)
          // Todo: Uncomment the following line once TokensService is fully implemented
          // await this.tokensService.updateTokenStatusFromSubgraph(eventData.token, eventData.status)
        },
      },
      [SubgraphEvents.recurringDonationDeactivated]: {
        queryName: 'recurringDonationDeactivateds',
        queryFragment: `
          id
          transactionHash
        `,
        processEvent: async (eventData: GraphQLRecurringDonationDeactivated) => {
          this.logger.log(`Processing recurringDonationDeactivated: ${JSON.stringify(eventData)}`)
          await this.recurringDonationsService.confirmCancelRecurring({
            id: eventData.id,
            timestamp: Date.now(),
          })
        },
      },
    }
  }

  async queuePendingTransactions(): Promise<void> {
    const pendingPayments = await this.transactionRepository.findPendingTransactions()
    this.logger.log(`Found ${pendingPayments.length} pending payment transactions to process`)

    await Promise.allSettled(
      pendingPayments.map(async (txn) => {
        const eventType =
          txn instanceof UserDealPaymentEntity
            ? SubgraphEvents.dealPayment
            : SubgraphEvents.directDonation
        await this.scheduleTransactionProcessing(txn.transaction_hash, eventType, txn.id)
      }),
    )

    const pendingWithdrawals = await this.transactionRepository.findPendingWithdrawTransactions()
    this.logger.log(`Found ${pendingWithdrawals.length} pending withdrawal transactions to process`)

    await Promise.allSettled(
      pendingWithdrawals.map(async (wd) => {
        await this.scheduleTransactionProcessing(
          wd.transaction_hash,
          SubgraphEvents.userWithdrawInitiate,
          wd.id,
        )
      }),
    )
  }

  async scheduleTransactionProcessing(
    transactionHash: string | null,
    eventType: SubgraphEvents,
    relatedEntityId?: string,
  ): Promise<void> {
    if (!transactionHash) {
      this.logger.warn(`Skipping event ${eventType} - no transaction hash provided.`)
      return
    }

    let existingLog = await this.processLogRepository.findOne({
      where: { transaction_hash: transactionHash, event_type: eventType },
    })

    if (existingLog) {
      if (existingLog.status === TransactionStatus.SUCCESS) {
        this.logger.log(
          `Skipping event ${eventType} for tx ${transactionHash} - already processed.`,
        )
        return
      }
      if (existingLog.retry_count >= this.MAX_RETRIES) {
        this.logger.warn(
          `Skipping event ${eventType} for tx ${transactionHash} - max retries reached.`,
        )
        return
      }
      existingLog.retry_count += 1
    } else {
      existingLog = this.processLogRepository.create({
        transaction_hash: transactionHash,
        event_type: eventType,
        status: TransactionStatus.PENDING,
        retry_count: 0,
        user_deal_payment:
          eventType === SubgraphEvents.dealPayment ? { id: relatedEntityId } : null,
        user_donation_payment:
          eventType === SubgraphEvents.directDonation ? { id: relatedEntityId } : null,
        user_withdrawal: [
          SubgraphEvents.userWithdrawInitiate,
          SubgraphEvents.userWithdrawComplete,
          SubgraphEvents.userWithdrawReverted,
        ].includes(eventType)
          ? { id: relatedEntityId }
          : null,
        nonprofit_funds: [
          SubgraphEvents.nonprofitWithdraw,
          SubgraphEvents.nonprofitFundsReceived,
          SubgraphEvents.nonprofitFundsSettled,
        ].includes(eventType)
          ? { id: relatedEntityId }
          : null,
      })
    }

    existingLog.last_processed_at = new Date()
    await this.processLogRepository.save(existingLog)

    await this.transactionQueue.add(
      'process-transaction-event',
      {
        transactionHash: transactionHash,
        eventType: eventType,
        logId: existingLog.id,
      },
      {
        attempts: this.MAX_RETRIES - (existingLog.retry_count ?? 0),
        backoff: {
          type: 'exponential',
          delay: this.DELAY,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    )
    this.logger.log(`Scheduled event ${eventType} for transaction ${transactionHash}`)
  }

  async verifyAndProcessEvent(
    transactionHash: string,
    logId: string,
    eventType: SubgraphEvents,
  ): Promise<boolean> {
    const processLog = await this.processLogRepository.findOne({ where: { id: logId } })
    if (!processLog) {
      this.logger.error(`Process log with ID ${logId} not found during verification.`)
      throw new Error(`Process log with ID ${logId} not found`)
    }

    processLog.last_processed_at = new Date()

    const handler = this.eventHandlers[eventType]
    if (!handler) {
      processLog.status = TransactionStatus.FAILED
      processLog.error_message = `No handler defined for event type: ${eventType}`
      await this.processLogRepository.save(processLog)
      this.logger.error(`No handler for event type ${eventType} with hash ${transactionHash}`)
      await this.updatePaymentStatusOnFailure(transactionHash, eventType)
      return false
    }

    try {
      const query = this.buildGraphQLQuery(
        transactionHash,
        handler.queryName,
        handler.queryFragment,
      )
      const response = await firstValueFrom(
        this.httpService.post(
          this.SUBGRAPH_URL,
          { query },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )

      const events = response.data?.data?.[handler.queryName] || []
      processLog.response_data = { events }

      if (events.length > 0) {
        for (const event of events) {
          await handler.processEvent(event, transactionHash)
        }
        processLog.status = TransactionStatus.SUCCESS
        this.logger.log(
          `Event ${eventType} for transaction ${transactionHash} processed successfully.`,
        )
      } else {
        processLog.status = TransactionStatus.PENDING
        processLog.error_message = `Event ${eventType} not found in subgraph for hash ${transactionHash}.`
        this.logger.warn(
          `Event ${eventType} for transaction ${transactionHash} not found in subgraph.`,
        )
      }
    } catch (error) {
      this.logger.error(
        `Error processing event ${eventType} for transaction ${transactionHash}: ${error.message}`,
        error.stack,
      )
      processLog.status = TransactionStatus.FAILED
      processLog.error_message = error.message

      await this.updatePaymentStatusOnFailure(transactionHash, eventType)

      throw error
    } finally {
      await this.processLogRepository.save(processLog)
    }
    return processLog.status === TransactionStatus.SUCCESS
  }

  async handleFailedEventProcessing(
    logId: string,
    eventType: SubgraphEvents,
    transactionHash: string,
  ) {
    const processLog = await this.processLogRepository.findOne({ where: { id: logId } })
    if (processLog && processLog.status !== TransactionStatus.SUCCESS) {
      // This function is typically called when a job permanently fails after all retries.
      processLog.status = TransactionStatus.FAILED
      // error_message should already be set from the last attempt.
      await this.processLogRepository.save(processLog)
      await this.updatePaymentStatusOnFailure(transactionHash, eventType)
      this.logger.warn(
        `Event ${eventType} for transaction ${transactionHash} has permanently failed after all retries. Log ID: ${logId}`,
      )
    }
  }

  async manuallyProcessTransactionByEvent(
    transactionHash: string,
    eventType: SubgraphEvents,
  ): Promise<boolean> {
    await this.scheduleTransactionProcessing(transactionHash, eventType, null)
    this.logger.log(`Manually scheduled event ${eventType} for transaction ${transactionHash}`)
    return true
  }

  async batchProcessTransactions(
    transactions: Array<{ hash: string; eventType: SubgraphEvents }>,
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    for (const tx of transactions) {
      try {
        await this.scheduleTransactionProcessing(tx.hash, tx.eventType, null)
        results[tx.hash] = true
      } catch (e) {
        results[tx.hash] = false
        this.logger.error(
          `Failed to queue manual batch tx ${tx.hash} for event ${tx.eventType}: ${e.message}`,
        )
      }
    }
    return results
  }

  async updateAllWalletBalances(): Promise<void> {
    this.logger.log('[updateAllWalletBalances] Starting wallet balance update...')
    const paymentWallets = await this.paymentWalletsRepository.find({
      where: { status: PaymentMethodStatus.ACTIVE },
    })
    const CHUNK_SIZE = 100
    let processedCount = 0
    for (let i = 0; i < paymentWallets.length; i += CHUNK_SIZE) {
      const chunk = paymentWallets.slice(i, i + CHUNK_SIZE)
      const addresses = chunk.map((w) => w.address.toLowerCase())
      const query = `query {
        tokenHolders(where: { address_in: [${addresses.map((a) => `"${a}"`).join(', ')}] }) {
          address
          balance
        }
      }`
      let holders: { address: string; balance: string }[] = []
      try {
        const { data } = await axios.post(this.SUBGRAPH_URL, { query })
        holders = data?.data?.tokenHolders || []
      } catch (error) {
        this.logger.error(
          `Bulk subgraph query error for wallet balances: ${error.message}`,
          error.stack,
        )
        continue
      }
      const balanceMap: Record<string, string> = {}
      holders.forEach((h) => {
        balanceMap[h.address.toLowerCase()] = h.balance
      })

      for (const wallet of chunk) {
        const bal = balanceMap[wallet.address.toLowerCase()] || '0'
        try {
          let balanceRecord = await this.walletBalanceRepository.findOne({
            where: { payment_wallet: { id: wallet.id } },
          })
          if (balanceRecord) {
            balanceRecord.balance = new BigNumber(bal)
          } else {
            balanceRecord = this.walletBalanceRepository.create({
              payment_wallet: wallet,
              balance: new BigNumber(bal),
            })
          }
          await this.walletBalanceRepository.save(balanceRecord)
          processedCount++
        } catch (err) {
          this.logger.error(
            `Failed to update balance for wallet address=${wallet.address}: ${err.message}`,
          )
        }
      }
    }
    this.logger.log(
      `[updateAllWalletBalances] Completed. Processed = ${processedCount}/${paymentWallets.length}`,
    )
  }

  async updateAllWalletBalancesThenUpdateRanks(): Promise<void> {
    await this.updateAllWalletBalances()
    await this.rankService.storePreviousUserRanks()
    const RANK_PAGE_SIZE = 1000
    for (let loop = 0; ; loop += 1) {
      const balances = await this.walletBalanceRepository
        .createQueryBuilder('wb')
        .leftJoin('wb.payment_wallet', 'pw')
        .select(['pw.address AS wallet_address', 'wb.balance AS min_balance'])
        .orderBy('wb.created', 'ASC')
        .take(RANK_PAGE_SIZE)
        .skip(loop * RANK_PAGE_SIZE)
        .getRawMany()

      if (balances.length === 0) {
        break
      }
      const payload: UpdateRanksDto = { values: balances, timestamp: new Date().getTime() }
      await this.rankService.updateUserRanks(payload)
    }
    this.logger.log('[updateAllWalletBalancesThenUpdateRanks] Done.')
  }

  private async updatePaymentStatusOnFailure(
    transactionHash: string,
    eventType: SubgraphEvents,
  ): Promise<void> {
    // Use a transaction to ensure atomicity of updating payment status and reverting points
    await this.userDealPaymentRepository.manager.transaction(async (transactionalEntityManager) => {
      if (eventType === SubgraphEvents.dealPayment) {
        const dealPayment = await transactionalEntityManager.findOne(UserDealPaymentEntity, {
          where: { transaction_hash: transactionHash, status: PAYMENT_STATUS.INITIATED },
          relations: ['user', 'payment_currency'],
        })

        if (dealPayment) {
          dealPayment.status = PAYMENT_STATUS.CANCELLED
          await transactionalEntityManager.save(UserDealPaymentEntity, dealPayment)
          this.logger.log(
            `Deal payment ${dealPayment.id} for hash ${transactionHash} marked as CANCELLED.`,
          )

          // Revert points if any were used
          if (dealPayment.points_used && dealPayment.points_used.isGreaterThan(0)) {
            try {
              await this.userPointsService.revertPointLockForDealPayment(
                dealPayment,
                transactionalEntityManager,
              )
              this.logger.log(
                `Points lock reverted for deal payment ${dealPayment.id} due to cancellation.`,
              )
            } catch (error) {
              this.logger.error(
                `Failed to revert points lock for deal payment ${dealPayment.id}: ${error.message}`,
                error.stack,
              )
            }
          }
        }
      } else if (eventType === SubgraphEvents.directDonation) {
        const donationPayment = await transactionalEntityManager.findOne(
          UserDonationPaymentEntity,
          {
            where: { transaction_hash: transactionHash, status: PAYMENT_STATUS.INITIATED },
          },
        )
        if (donationPayment) {
          donationPayment.status = PAYMENT_STATUS.CANCELLED
          await transactionalEntityManager.save(UserDonationPaymentEntity, donationPayment)
          this.logger.log(
            `Donation payment ${donationPayment.id} for hash ${transactionHash} marked as CANCELLED.`,
          )
        }
      }
    })
  }

  private buildGraphQLQuery(
    transactionHash: string,
    queryName: string,
    queryFragment: string,
  ): string {
    return `
      query {
        ${queryName}(
          where: { transactionHash: "${transactionHash}" }
          first: 10
        ) {
          ${queryFragment}
        }
      }
    `
  }

  private formatPaymentId(paymentId: string | number): string {
    try {
      if (typeof paymentId === 'string') {
        if (paymentId.startsWith('0x')) {
          return paymentId.toLowerCase()
        }
        return `0x${BigInt(paymentId).toString(16)}`
      }
      return `0x${BigInt(paymentId).toString(16)}`
    } catch (e) {
      this.logger.warn(`Failed to format payment ID "${paymentId}": ${e.message}. Returning as is.`)
      return String(paymentId)
    }
  }
}
