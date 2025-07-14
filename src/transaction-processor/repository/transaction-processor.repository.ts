import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { USER_WITHDRAWAL_STATUS } from '@app/src/users/withdrawal/enums'
import { TransactionStatus } from '@app/src/transaction-processor/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums/payment-status.enum'
import { NonprofitFundsEntity } from '@app/src/nonprofit/funds/entities/nonprofit-funds.entity'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { TransactionProcessLogEntity } from '@app/src/transaction-processor/entities/transaction-process-log.entity'

@Injectable()
export class TransactionProcessorRepository {
  constructor(
    @InjectRepository(UserDealPaymentEntity)
    private userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(TransactionProcessLogEntity)
    private processLogRepository: Repository<TransactionProcessLogEntity>,
    @InjectRepository(UserDonationPaymentEntity)
    private userDonationPaymentRepository: Repository<UserDonationPaymentEntity>,
    @InjectRepository(UserWithdrawalEntity)
    private userWithdrawalRepository: Repository<UserWithdrawalEntity>,
    @InjectRepository(NonprofitFundsEntity)
    private nonprofitFundsRepository: Repository<NonprofitFundsEntity>,
  ) {}

  async findPendingTransactions(): Promise<(UserDealPaymentEntity | UserDonationPaymentEntity)[]> {
    const dealPayments = await this.userDealPaymentRepository
      .createQueryBuilder('payment')
      .where(
        `payment.transaction_hash IS NOT NULL 
        AND payment.status = :status
        AND NOT EXISTS (
          SELECT 1 FROM transaction_process_log log
          WHERE log."userDealPaymentId" = payment.id
          AND (log.status = :logStatus AND log.retry_count >= :maxRetries)
        )`,
        {
          status: PAYMENT_STATUS.INITIATED,
          logStatus: TransactionStatus.PENDING,
          maxRetries: 3,
        },
      )
      .select(['payment.id', 'payment.transaction_hash'])
      .orderBy('payment.created', 'ASC')
      .limit(25)
      .getMany()

    const donationPayments = await this.userDonationPaymentRepository
      .createQueryBuilder('payment')
      .where(
        `payment.transaction_hash IS NOT NULL 
        AND payment.status = :status
        AND NOT EXISTS (
          SELECT 1 FROM transaction_process_log log
          WHERE log."userDonationPaymentId" = payment.id
          AND (log.status = :logStatus AND log.retry_count >= :maxRetries)
        )`,
        {
          status: PAYMENT_STATUS.INITIATED,
          logStatus: TransactionStatus.PENDING,
          maxRetries: 3,
        },
      )
      .select(['payment.id', 'payment.transaction_hash'])
      .orderBy('payment.created', 'ASC')
      .limit(25)
      .getMany()

    return [...dealPayments, ...donationPayments]
  }

  async findPendingWithdrawTransactions(): Promise<UserWithdrawalEntity[]> {
    return this.userWithdrawalRepository
      .createQueryBuilder('withdrawal')
      .where('withdrawal.status = :status', { status: USER_WITHDRAWAL_STATUS.INITIATED })
      .andWhere('withdrawal.transaction_hash IS NOT NULL')
      .select(['withdrawal.id', 'withdrawal.transaction_hash'])
      .orderBy('withdrawal.created', 'ASC')
      .andWhere(
        `NOT EXISTS (
          SELECT 1 FROM transaction_process_log log
          WHERE log."userWithdrawalId" = withdrawal.id
          AND (log.status = :logStatus AND log.retry_count >= :maxRetries)
        )`,
        { logStatus: TransactionStatus.PENDING, maxRetries: 3 },
      )
      .limit(25)
      .getMany()
  }

  async findPendingNonprofitFundsTransactions(): Promise<NonprofitFundsEntity[]> {
    return this.nonprofitFundsRepository
      .createQueryBuilder('nonprofit_funds')
      .where('nonprofit_funds.unsettled_funds > 0')
      .select(['nonprofit_funds.id', 'nonprofit_funds.unsettled_funds'])
      .orderBy('nonprofit_funds.created', 'ASC')
      .limit(25)
      .getMany()
  }
}
