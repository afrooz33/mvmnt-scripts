import BigNumber from 'bignumber.js'
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { PAYMENT_STATUS, DONATION_SOURCE } from '@app/src/users/payment/enums'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Entity('user_donation_payment')
export class UserDonationPaymentEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @OneToMany(() => UserPointsEntity, (points) => points.donation_points, { cascade: true })
  points: UserPointsEntity[]

  @OneToOne(() => UserDonationsEntity, (donation) => donation.user_donation_payment, {
    cascade: true,
  })
  donation: UserDonationsEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  donation_amount: BigNumber

  @Column({
    type: 'enum',
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.INITIATED,
  })
  status: PAYMENT_STATUS

  @ManyToOne(() => TokenWhitelistEntity, {})
  currency: TokenWhitelistEntity

  @Column('boolean', { default: false })
  dex_required: boolean

  @Column('boolean', { default: false })
  ramping_required: boolean

  @ManyToOne(() => DonationProjectEntity)
  donation_project: DonationProjectEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  gas_fees: BigNumber

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  user_points: BigNumber

  @Column('text', {
    nullable: true,
  })
  transaction_hash: string

  @Column({
    type: 'enum',
    enum: Object.values(DONATION_SOURCE),
  })
  source: DONATION_SOURCE

  @Column('uuid', {
    nullable: true,
    comment: `ID of the source of donation`,
  })
  reference_id: string

  @ManyToOne(() => PaymentWalletsEntity)
  donor_wallet: PaymentWalletsEntity

  /**
   * @description When the donation is manually integrated from RE2, existing userId is stored here.
   *
   * @default null
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  original_user: UserEntity
}
