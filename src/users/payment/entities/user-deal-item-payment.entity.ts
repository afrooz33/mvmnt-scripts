import BigNumber from 'bignumber.js'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { DonationType } from '@app/src/users/deal/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { UserDealPaymentEntity } from './user-deal-payment.entity'

@Entity('user_deal_item_payment')
export class UserDealItemPaymentEntity extends MyEntity {
  @ManyToOne(() => UserDealPaymentEntity, (payment) => payment.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  payment: UserDealPaymentEntity

  @OneToMany(() => UserPointsEntity, (points) => points.payment_points, { cascade: true })
  points: UserPointsEntity[]

  @OneToOne(() => UserDonationsEntity, (donation) => donation.user_deal_item_payment, {
    cascade: true,
  })
  donation: UserDonationsEntity

  @ManyToOne(() => UserEntity)
  sender: UserEntity

  @ManyToOne(() => UserEntity)
  receiver: UserEntity

  @ManyToOne(() => DealEntity)
  deal: DealEntity

  @ManyToOne(() => DealVariantEntity, { nullable: true })
  deal_variant: DealVariantEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  deal_amount: BigNumber

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  payment_currency: TokenWhitelistEntity

  @Column({
    type: 'enum',
    enum: Object.values(DonationType),
  })
  donation_type: DonationType

  @Column('float')
  donation_value: number

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  donation_amount: BigNumber

  @ManyToOne(() => DonationProjectEntity)
  @JoinColumn()
  donation_project: DonationProjectEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  buyer_points: BigNumber

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  seller_points: BigNumber

  @Column({
    type: 'int',
    default: 0,
    nullable: false,
  })
  quantity: number

  @Column({
    type: 'enum',
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.INITIATED,
  })
  status: PAYMENT_STATUS

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  gas_fees: BigNumber

  @ManyToOne(() => ResellingLinkEntity, { nullable: true })
  @JoinColumn()
  reselling_link?: ResellingLinkEntity

  // new fields for store currency conversion

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: true,
    comment: 'Equivalent price in fiat currency (e.g., USD) at the time of purchase',
  })
  fiat_equivalent_token_amount: BigNumber

  // This is implicitly stored via payment_currency relation,
  // but an explicit symbol can be useful.
  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'The cryptocurrency used for the transaction',
  })
  payment_currency_symbol: string

  @Column({
    type: 'varchar',
    length: 10,
    default: 'USD',
    comment: 'The target fiat currency for conversion',
  })
  fiat_currency_symbol: string

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: true,
    comment: 'Conversion rate from payment_currency to fiat_currency at the time of purchase',
  })
  conversion_rate_to_fiat: BigNumber
}
