import {
  Column,
  Entity,
  OneToOne,
  JoinTable,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  VirtualColumn,
} from 'typeorm'
import {
  DealType,
  DealStatus,
  DonationType,
  ItemCondition,
  DealCurrencyType,
  DealResellingCap,
  DealAvailability,
  ShippingCoveredBy,
  ReturnEligibility,
  DealAllowReselling,
  PurchaseAvailability,
  DealResellingAmountType,
} from '@app/src/users/deal/enums'
import { MyEntity } from '@app/src/shared/base'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { DealReviewEntity } from '@app/src/users/deal/review/entities/review.entity'
import { DealShareEntity } from '@app/src/users/share/deal/entities/deal-share.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'
import { LikeEntity as DealLikesEntity } from '@app/src/users/deal/like/entities/like.entity'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { ShippingMethodEntity } from '@app/src/admin/shipping-methods/entities/shipping-method.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { RecentlyViewedDealEntity } from '@app/src/users/deal/recently-viewed/entities/recently-viewed.entity'
import { UpdateNoteEntity as DealUpdateNoteEntity } from '@app/src/users/deal/update-note/entities/update-note.entity'
import {
  GetTotalBidsQuery,
  GetCurrentBidQuery,
  GetTotalLikesQuery,
  GetTotalSharesQuery,
  GetNetDonationQuery,
  GetGrossDonationsQuery,
  GetTotalDealSalesQuery,
} from '@app/src/shared/sql'
import { DealVariantEntity } from './deal-variant.entity'
import { DealShippingFeeEntity } from './deal-shipping-fee.entity'
import { DealRaffleEntity } from './deal-raffle.entity'
import { DealOptionEntity } from './deal-option.entity'
import { toResponseObject } from './methods'

@Entity('deals')
export class DealEntity extends MyEntity {
  @Column({
    type: 'enum',
    enum: Object.values(DealType),
    default: DealType.AUCTION,
    nullable: false,
  })
  deal_type: DealType

  @Column({ nullable: true, length: 255, type: 'varchar' })
  name: string

  @ManyToMany(() => ImagesEntity, (image) => image.deals)
  @JoinTable()
  images: ImagesEntity[]

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'text', nullable: true })
  size: string

  @ManyToOne(() => DealCategoryEntity, { nullable: true })
  @JoinColumn()
  category: DealCategoryEntity

  @ManyToOne(() => BrandEntity, { nullable: true })
  @JoinColumn()
  brand: BrandEntity

  @Column({
    type: 'enum',
    enum: Object.values(ItemCondition),
    default: ItemCondition.NEW,
    nullable: true,
  })
  item_condition: ItemCondition

  @Column({
    type: 'enum',
    enum: Object.values(ReturnEligibility),
    default: null,
    nullable: true,
  })
  return_eligibility: ReturnEligibility

  @Column({
    type: 'enum',
    enum: Object.values(ShippingCoveredBy),
    default: ShippingCoveredBy.SELLER,
    nullable: true,
  })
  shipping_covered_by: ShippingCoveredBy

  @ManyToOne(() => ShippingMethodEntity, {
    nullable: true,
  })
  @JoinColumn()
  shipping_method: ShippingMethodEntity

  @Column({ type: 'text', nullable: true })
  sender_location?: string

  @Column({ type: 'integer', nullable: true, default: 0 })
  estimated_delivery_days: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: null })
  starting_price: number

  @Column('enum', {
    enum: Object.values(PurchaseAvailability),
    nullable: false,
    default: PurchaseAvailability.IMMEDIATELY,
  })
  purchase_availability: PurchaseAvailability

  @Column('enum', {
    enum: Object.values(DealAvailability),
    nullable: false,
    default: DealAvailability.MATCH_PURCHASE_AVAILABILITY,
  })
  deal_availability: DealAvailability

  @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date

  @Column('timestamp with time zone', { nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  deal_access_date: Date

  @Column('timestamp with time zone', { nullable: true })
  end_date: Date

  @ManyToOne(() => NonprofitUserEntity, (nonprofit) => nonprofit.deals)
  @JoinColumn()
  donation_nonprofit?: NonprofitUserEntity

  @ManyToOne(() => DonationProjectEntity, (donationProject) => donationProject.deals)
  @JoinColumn()
  donation_project?: DonationProjectEntity

  @ManyToOne(() => UserEntity, (user) => user.deals)
  @JoinColumn()
  @JoinTable()
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(DonationType),
    default: DonationType.FIXED_PER_ORDER,
    nullable: false,
  })
  donation_type: DonationType

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
  donation_amount: number

  @Column({
    type: 'enum',
    enum: Object.values(DealStatus),
    default: DealStatus.ON_DEAL,
    nullable: false,
  })
  status: DealStatus

  @Column({ type: 'text', nullable: true })
  admin_memo: string

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(DealCurrencyType),
    default: DealCurrencyType.CRYPTO_TOKEN,
  })
  currency: DealCurrencyType

  @OneToMany(() => DealVariantEntity, (dealVariant) => dealVariant.deal, {
    cascade: true,
  })
  @JoinTable()
  variants?: DealVariantEntity[]

  @ManyToMany(() => DealOptionEntity)
  @JoinTable()
  options?: DealOptionEntity[]

  @OneToMany(() => DealUpdateNoteEntity, (updateNote) => updateNote.deal, {
    cascade: true,
  })
  @JoinColumn()
  @JoinTable()
  updateNotes?: DealUpdateNoteEntity[]

  @OneToMany(() => DealLikesEntity, (like) => like.deal)
  @JoinTable()
  liked_deals?: DealLikesEntity[]

  @OneToMany(() => RecentlyViewedDealEntity, (viewed) => viewed.deal)
  @JoinTable()
  recently_viewed?: RecentlyViewedDealEntity[]

  @OneToMany(() => DealShareEntity, (share) => share.deal)
  @JoinTable()
  shared_deals?: DealShareEntity[]

  @OneToOne(() => DealRaffleEntity, (raffle) => raffle.deal, {
    cascade: true,
  })
  @JoinTable()
  raffles?: DealRaffleEntity

  @OneToMany(() => DealShippingFeeEntity, (shippingFee) => shippingFee.deal, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  shipping_fee?: DealShippingFeeEntity[]

  @OneToMany(() => BidEntity, (bid) => bid.deal)
  @JoinColumn()
  bids: BidEntity[]

  @OneToMany(() => BuynowCartEntity, (cart) => cart.user)
  buynow_cart?: BuynowCartEntity[]

  @OneToMany(() => ResellingLinkEntity, (deal_reselling_link) => deal_reselling_link.deal)
  deal_reselling_links?: ResellingLinkEntity[]

  @Column('text', { nullable: true, default: '' })
  reason_to_delete: string

  @Column({ type: 'boolean', default: false })
  is_one_of_kind: boolean

  @OneToMany(() => DealReviewEntity, (review) => review.deal, {
    cascade: true,
  })
  @JoinTable()
  reviews?: DealReviewEntity[]

  @VirtualColumn({
    query: (alias) => GetTotalBidsQuery(alias),
  })
  total_bids?: string

  @VirtualColumn({
    query: (alias) => GetCurrentBidQuery(alias),
  })
  current_bid?: string

  @VirtualColumn({
    query: (alias) =>
      GetTotalDealSalesQuery({
        select: 'COALESCE(COUNT(DISTINCT "payment"."userId")::int, 0)',
        dealId: `${alias}."id"`,
      }),
  })
  participants?: string

  @VirtualColumn({
    query: (alias) => GetGrossDonationsQuery(alias),
  })
  total_donation?: string

  @VirtualColumn({
    query: (alias) =>
      GetTotalDealSalesQuery({
        dealId: `${alias}."id"`,
      }),
  })
  total_sales?: string

  @VirtualColumn({
    query: (alias) => GetNetDonationQuery(alias),
  })
  net_donation?: string

  @VirtualColumn({
    query: (alias) => GetTotalSharesQuery(alias),
  })
  share_count?: number

  @VirtualColumn({
    query: (alias) => GetTotalLikesQuery(alias),
  })
  like_count?: number

  @VirtualColumn({
    query: (alias) => `(SELECT
      COUNT(*)
    FROM
      "user_deal_review"
    WHERE "user_deal_review"."dealId" = ${alias}."id" AND "user_deal_review"."status" IN ('${DealRatingStatus.ENABLED}', '${DealRatingStatus.REPORTED}')
    )`,
  })
  buynow_review_count?: number

  @VirtualColumn({
    query: (alias) => `(SELECT
      ROUND(AVG("user_deal_review"."rating")::numeric, 1)
    FROM
      "user_deal_review"
    WHERE "user_deal_review"."dealId" = ${alias}."id")`,
  })
  buynow_rate?: number

  @ManyToMany(() => ShippingProfileEntity, (shipping_profile) => shipping_profile.deals)
  shipping_profiles: ShippingProfileEntity[]

  /**
   * @description Reselling related fields
   */
  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(DealAllowReselling),
    default: DealAllowReselling.DISABLE,
  })
  allow_reselling: DealAllowReselling

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(DealResellingAmountType),
    default: DealResellingAmountType.FIXED_PER_AMOUNT,
  })
  reselling_amount_type: DealResellingAmountType

  @Column({
    type: 'text',
    nullable: true,
    default: '',
  })
  reselling_fee: string

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(DealResellingCap),
    default: DealResellingCap.NONE,
  })
  reselling_cap: DealResellingCap

  @Column({
    type: 'text',
    nullable: true,
    default: '',
  })
  reselling_cap_value: string

  public toResponseObject = toResponseObject.bind(this)
}
