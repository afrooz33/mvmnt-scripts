import BigNumber from 'bignumber.js'
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DONATION_STATUS, DonationType, IntegrationMode } from '@app/src/donations/enums'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import { toResponseObject } from './methods'

@Entity('user_donations')
export class UserDonationsEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(DonationType),
    nullable: false,
    default: DonationType.DIRECT_DONATION,
  })
  reason: DonationType

  @Column('boolean', { default: false })
  is_recurring: boolean

  @Column('timestamptz', { nullable: true })
  settlement_date: Date

  @ManyToOne(() => DonationProjectEntity)
  donation_project: DonationProjectEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  amount: BigNumber

  @Column({
    type: 'enum',
    enum: Object.values(DONATION_STATUS),
    default: DONATION_STATUS.INITIATED,
    nullable: false,
  })
  status: DONATION_STATUS

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
  })
  system_fees: BigNumber | null

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  gas_fees: BigNumber | null

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  payment_currency: TokenWhitelistEntity

  @OneToOne(() => UserDonationPaymentEntity, (payment) => payment.donation, { nullable: true })
  @JoinColumn()
  user_donation_payment: UserDonationPaymentEntity

  @OneToOne(() => UserDealItemPaymentEntity, (payment) => payment.donation, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user_deal_item_payment: UserDealItemPaymentEntity

  @OneToOne(() => RecurringDonationSignaturesEntity, (signature) => signature.id, {
    nullable: true,
  })
  @JoinColumn()
  recurring_signature: RecurringDonationSignaturesEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  unsettled_amount: BigNumber | null

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  admin_share: BigNumber

  /**
   * @description When the donation is manually integrated from RE2, existing userId is stored here.
   *
   * @default null
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  original_user: UserEntity

  /**
   * @description The mode of integration for the RE2 donation.
   *
   * @default IntegrationMode.AUTOMATIC
   */
  @Column({
    type: 'enum',
    enum: Object.values(IntegrationMode),
    default: IntegrationMode.AUTOMATIC,
  })
  integration_mode: IntegrationMode

  /**
   * @description The code of the donation.
   *
   * @default null
   */
  @Column({ nullable: true, unique: true })
  donation_code: string

  /**
   * @description Flag to check if donation receipt was sent.
   *
   * @default false
   */
  @Column({ default: false })
  receipt_sent: boolean

  /**
   * @description The date when the receipt was sent.
   *
   * @default null
   */
  @Column({ nullable: true })
  receipt_sent_at: Date

  public toResponseObject = toResponseObject.bind(this)
}
