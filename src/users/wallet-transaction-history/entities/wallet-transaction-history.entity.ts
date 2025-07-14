import BigNumber from 'bignumber.js'
import { MyEntity } from '@app/src/shared/base'
import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import {
  TransactionCategory,
  TransactionFlowIndicator,
  WalletHistoryTransactionType,
} from '@app/src/users/wallet-transaction-history/enums'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Entity('wallet_transaction_history')
export class WalletTransactionHistoryEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  owner_user: UserEntity

  @Index()
  @ManyToOne(() => PaymentWalletsEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  affected_wallet: PaymentWalletsEntity

  @Index()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  transaction_timestamp: Date

  @Index()
  @Column('enum', { enum: WalletHistoryTransactionType, nullable: false })
  transaction_type: WalletHistoryTransactionType

  @Index()
  @Column('enum', { enum: TransactionCategory, nullable: false })
  transaction_category: TransactionCategory

  @Column('enum', { enum: TransactionFlowIndicator, nullable: false })
  flow_indicator: TransactionFlowIndicator

  @Column({
    scale: 18,
    precision: 28,
    default: null,
    nullable: true,
    type: 'decimal',
    transformer: new DecimalTransformer(),
  })
  amount?: BigNumber

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  @JoinColumn()
  currency: TokenWhitelistEntity

  @Column({ type: 'boolean', default: false })
  is_point_exchange: boolean

  @Column({
    type: 'bigint',
    default: null,
    nullable: true,
  })
  points?: number

  @ManyToOne(() => UserDealPaymentEntity, { nullable: true })
  @JoinColumn()
  user_deal_payment?: UserDealPaymentEntity

  @ManyToOne(() => UserDealItemPaymentEntity, { nullable: true })
  @JoinColumn()
  user_deal_item_payment?: UserDealItemPaymentEntity

  @Column({ type: 'boolean', nullable: true })
  is_deal_purchase?: boolean

  @Column({ type: 'boolean', nullable: true })
  is_deal_sale?: boolean

  // Donation-related associations
  @ManyToOne(() => UserDonationsEntity, { nullable: true })
  @JoinColumn()
  donation?: UserDonationsEntity

  @ManyToOne(() => NonprofitUserEntity, { nullable: true })
  @JoinColumn()
  nonprofit?: NonprofitUserEntity

  @ManyToOne(() => DonationProjectEntity, { nullable: true })
  @JoinColumn()
  donation_project?: DonationProjectEntity

  @ManyToOne(() => FundraiserEntity, { nullable: true })
  @JoinColumn()
  fundraiser?: FundraiserEntity

  @Column({ type: 'boolean', nullable: true })
  is_re2_integration?: boolean

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  sender_user?: UserEntity

  @ManyToOne(() => PaymentWalletsEntity, { nullable: true })
  @JoinColumn()
  sender_wallet?: PaymentWalletsEntity

  @Column({ type: 'varchar', length: 255, nullable: true })
  sender_external_address?: string

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  receiver_user?: UserEntity

  @ManyToOne(() => PaymentWalletsEntity, { nullable: true })
  @JoinColumn()
  receiver_wallet?: PaymentWalletsEntity

  @Column({ type: 'varchar', length: 255, nullable: true })
  receiver_external_address?: string

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  fee_amount?: BigNumber

  @ManyToOne(() => TokenWhitelistEntity, { nullable: true })
  @JoinColumn()
  fee_currency?: TokenWhitelistEntity

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_hash?: string
}
