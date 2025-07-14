import {
  Column,
  Entity,
  ManyToOne,
  JoinTable,
  OneToMany,
  ManyToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm'
import { randomBytes } from 'crypto'
import {
  CouponType,
  CouponStatus,
  CouponTargetUser,
  CouponTargetDeal,
  CouponDiscountType,
  CouponTargetCountry,
  CouponUserSelection,
  PurchaseRequirementType,
} from '@app/src/admin/coupons/enums'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { CouponDealEntity } from './coupon-deal.entity'
import { CouponTranslationEntity } from './coupons.translation.entity'
import { CouponUserSearchConditionsEntity as UserSearchConditions } from './coupon-user-search-conditions.entity'
import { toResponseObject } from './methods'

@Entity('coupons')
export class CouponsEntity extends MyEntity {
  @Column('integer', { nullable: false })
  display_order: number

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  code: string

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(CouponType),
    default: CouponType.PERCENTAGE,
  })
  coupon_type: CouponType

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(CouponDiscountType),
    default: null,
  })
  discount_type: CouponDiscountType

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(PurchaseRequirementType),
    default: null,
  })
  purchase_requirement_type: PurchaseRequirementType

  @Column({ type: 'smallint', nullable: true, default: null })
  purchase_requirement: number

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  start_date: Date

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  end_date: Date

  @Column({ type: 'smallint', nullable: false, default: 0 })
  discount: number

  @Column({ type: 'smallint', nullable: true })
  max_discount: number

  @Column({ type: 'smallint', nullable: true })
  min_order_amount: number

  @Column({ type: 'smallint', nullable: true })
  max_usage: number

  @Column({ type: 'smallint', nullable: true })
  max_usage_per_user: number

  @Column({ type: 'smallint', nullable: true })
  max_shipping_fee: number

  @Column({ type: 'boolean', default: false })
  is_shipping_fee_excluded: boolean

  @Column({ type: 'smallint', default: 0 })
  exclude_shipping_fee: number

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(CouponTargetUser),
    default: CouponTargetUser.ALL,
  })
  target_user: CouponTargetUser

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(CouponTargetDeal),
    default: CouponTargetDeal.ALL,
  })
  target_deal: CouponTargetDeal

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(CouponTargetCountry),
    default: CouponTargetCountry.ALL,
  })
  target_country: CouponTargetCountry

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(CouponUserSelection),
    default: CouponUserSelection.AUTO,
  })
  user_selection_mode: CouponUserSelection

  @OneToMany(
    () => UserSearchConditions,
    (couponSearchConditions) => couponSearchConditions.coupon,
    {
      cascade: true,
    },
  )
  user_search_conditions: UserSearchConditions[]

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(CouponStatus),
    default: CouponStatus.ENABLED,
  })
  status: CouponStatus

  @OneToMany(() => CouponTranslationEntity, (translation) => translation.coupon, {
    cascade: true,
  })
  @JoinColumn()
  @JoinTable()
  translations: CouponTranslationEntity[]

  @ManyToOne(() => UserEntity, (user) => user.coupons, {
    nullable: true,
  })
  @JoinColumn()
  user: UserEntity

  @ManyToMany(() => UserEntity, { nullable: true })
  @JoinTable({ name: 'coupons_users' })
  users: UserEntity[]

  @OneToMany(() => CouponDealEntity, (couponDeal) => couponDeal.coupon, {
    cascade: true,
  })
  deals_variants: CouponDealEntity[]

  @ManyToMany(() => CountryEntity, { nullable: true })
  @JoinTable({ name: 'coupons_countries' })
  countries: CountryEntity[]

  @BeforeInsert()
  async uniqueCouponCode() {
    if (this.code) return

    this.code = randomBytes(6).toString('hex').toUpperCase()
  }

  public toResponseObject = toResponseObject.bind(this)
}
