import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { NonprofitFundsEntity } from '@app/src/nonprofit/funds/entities/nonprofit-funds.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import {
  SubgraphEvents,
  TransactionStatus,
  TransactionType,
} from '@app/src/transaction-processor/enums'

@Entity('transaction_process_log')
export class TransactionProcessLogEntity extends MyEntity {
  @Column({ type: 'varchar', nullable: true })
  transaction_id: string

  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: false,
    default: TransactionType.DEAL_PAYMENT,
  })
  transaction_type: TransactionType

  @ManyToOne(() => UserDealPaymentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user_deal_payment: UserDealPaymentEntity | null

  @ManyToOne(() => UserDonationPaymentEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user_donation_payment: UserDonationPaymentEntity | null

  @ManyToOne(() => UserWithdrawalEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user_withdrawal: UserWithdrawalEntity | null

  @ManyToOne(() => NonprofitFundsEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  nonprofit_funds: NonprofitFundsEntity | null

  @Index()
  @Column({ nullable: true })
  transaction_hash: string | null

  @Column({
    type: 'enum',
    enum: SubgraphEvents,
    nullable: true,
    comment: 'The specific subgraph event this log entry pertains to, if applicable.',
  })
  event_type: SubgraphEvents | null

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus

  @Column({ default: 0 })
  retry_count: number

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_processed_at: Date | null

  @Column({ type: 'jsonb', nullable: true })
  response_data: Record<string, any> | null

  @Column({ type: 'text', nullable: true })
  error_message: string | null
}
