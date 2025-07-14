import BigNumber from 'bignumber.js'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import {
  POINTS_TYPE,
  POINTS_REASON,
  POINTS_STATUS,
} from '@app/src/users/points/enums/user-points.enum'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { UserPointUpdatesEntity } from './user-points-updates.entity'

@Entity('user_points')
export class UserPointsEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @ManyToOne(() => UserDealItemPaymentEntity, (payment) => payment.points, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  payment_points: UserDealItemPaymentEntity

  @OneToMany(() => UserPointUpdatesEntity, (update) => update.user_point, {
    cascade: true,
  })
  updates: UserPointUpdatesEntity[]

  @ManyToOne(() => UserDonationPaymentEntity, (donation) => donation.points, { nullable: true })
  @JoinColumn()
  donation_points: UserDonationPaymentEntity

  @Column({
    type: 'enum',
    enum: Object.values(POINTS_REASON),
  })
  reason: POINTS_REASON

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
    enum: Object.values(POINTS_STATUS),
    default: POINTS_STATUS.LOCKED,
  })
  status: POINTS_STATUS

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  withdraw_currency: TokenWhitelistEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  remaining: BigNumber

  @Column({
    type: 'enum',
    enum: Object.values(POINTS_TYPE),
  })
  type: POINTS_TYPE

  @Column('timestamptz')
  expiry_date: Date

  @Column('timestamptz')
  delivery_date: Date

  /**
   * @description When the donation is manually integrated from RE2, existing userId is stored here.
   *
   * @default null
   */
  @ManyToOne(() => UserEntity, { nullable: true })
  original_user: UserEntity

  @Index()
  @Column('uuid', { nullable: true })
  locked_for_deal_payment_id: string | null
}
