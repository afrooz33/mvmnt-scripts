import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  VirtualColumn,
} from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { hashMethod, compareMethod } from '@app/src/shared/entities/methods'
import { GetDealDonationQuery, GetUserDealSalesQuery } from '@app/src/shared/sql'
import { UserGrade } from '@app/src/users/grades/enums'
import { FollowType } from '@app/src/users/follower/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { UserRank } from '@app/src/users/rank/enums/ranks.enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { UserStarsEntity } from '@app/src/users/stars/entities/stars.entity'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { ReportEntity } from '@app/src/users/deal/report/entities/report.entity'
import { WishlistEntity } from '@app/src/users/wishlist/entities/wishlist.entity'
import { FollowerEntity } from '@app/src/users/follower/entities/follower.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { DealReviewEntity } from '@app/src/users/deal/review/entities/review.entity'
import { UserGender, AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { EmailChangeEntity } from '@app/src/users/email-change/entities/email-change.entity'
import { LikeEntity as DealLikesEntity } from '@app/src/users/deal/like/entities/like.entity'
import { PaymentCardsEntity } from '@app/src/users/payment-method/entities/payment-cards.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { ActivityReportEntity } from '@app/src/users/activity-reports/entities/activity-report.entity'
import { UserBusinessShopInfoEntity } from '@app/src/users/user/entities/user_business_shop_info.entity'
import { UserIdentityDocumentsEntity } from '@app/src/users/profile/entities/user_identity_documents.entity'
import { TemplateEntity as DealTemplateEntity } from '@app/src/users/deal/template/entities/template.entity'
import { RecentlyViewedDealEntity } from '@app/src/users/deal/recently-viewed/entities/recently-viewed.entity'
import { ActivityReportCommentEntity } from '@app/src/users/activity-reports/entities/activity-report-comment.entity'
import { DealShippingFeeTemplateEntity } from '@app/src/users/deal/shipping-fee-template/entities/shipping-fee.entity'
import { toResponseObject } from './methods'
import { LoginActivity } from './login-activity.entity'
import {
  Blocked,
  EmailVerification,
  NonprofitVerification,
  TwoFactorAuthentication,
} from './properties'
import { UserSessionEntity } from './user-session.entity'

@Entity('users')
export class UserEntity extends MyEntity {
  @Column({
    type: 'text',
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
    unique: true,
  })
  email: string

  @Column({
    type: 'text',
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
    unique: true,
  })
  username: string

  @Column('text', { nullable: false })
  display_name: string

  @Column('text', { nullable: false })
  password: string

  @Column({
    type: 'enum',
    enum: Object.values(UserRank),
    default: UserRank.Bronze,
    nullable: true,
  })
  rank: UserRank

  @Column('text', { nullable: true })
  brand_url: string

  @Column({
    type: 'enum',
    enum: Object.values(UserGender),
    default: UserGender.NA,
    nullable: false,
  })
  gender: UserGender

  @Column('jsonb', {
    default: {
      enabled: false,
      secret: null,
      recovery_codes: [],
    },
  })
  two_factor_authentication: TwoFactorAuthentication

  @Column({
    type: 'enum',
    enum: Object.values(UserAccountType),
    default: UserAccountType.INDIVIDUAL_PERSONAL,
    nullable: false,
  })
  account_type: UserAccountType

  @Column({
    type: 'enum',
    enum: Object.values(AccountStatus),
    default: AccountStatus.UNDER_REVIEW,
    nullable: false,
  })
  account_status: AccountStatus

  @Column('jsonb', { default: {} })
  email_verification: EmailVerification

  @Column('text', { nullable: true })
  reset_password_token: string

  @Column('jsonb', { default: {} })
  nonprofit_verification: NonprofitVerification

  @Column('boolean', { default: false, nullable: false })
  is_verified: boolean

  @Column('boolean', { default: true, nullable: false })
  sync_re2_donations: boolean

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  @JoinTable()
  profile?: ProfileEntity

  @OneToOne(() => NonprofitUserEntity, { nullable: true })
  @JoinColumn()
  nonprofit?: NonprofitUserEntity

  @OneToOne(() => UserBusinessShopInfoEntity, (shop_info) => shop_info.user, {
    cascade: true,
  })
  @JoinTable()
  shop_info?: UserBusinessShopInfoEntity

  @OneToMany(() => DealEntity, (deal) => deal.user)
  @JoinTable()
  deals?: DealEntity[]

  @OneToMany(() => DealReviewEntity, (deal) => deal.user)
  @JoinTable()
  reviews?: DealReviewEntity[]

  @OneToMany(() => LoginActivity, (activity) => activity.user)
  @JoinTable()
  login_activity?: LoginActivity[]

  @OneToMany(() => DealEntity, (deal) => deal.user)
  @JoinTable()
  liked_deals?: DealLikesEntity[]

  @OneToMany(() => RecentlyViewedDealEntity, (viewed) => viewed.user)
  @JoinTable()
  recently_viewed?: RecentlyViewedDealEntity[]

  @OneToMany(() => DealTemplateEntity, (template) => template.user)
  templates?: DealTemplateEntity[]

  @OneToOne(() => UserIdentityDocumentsEntity, (documents) => documents.user)
  identity_documents?: UserIdentityDocumentsEntity

  @OneToMany(() => DealShippingFeeTemplateEntity, (template) => template.user)
  shipping_fee_templates?: DealShippingFeeTemplateEntity[]

  @Column('text', { nullable: true })
  admin_memo?: string

  @Column('jsonb', { default: null, nullable: true })
  blocked_details?: Blocked

  @OneToMany(() => FollowerEntity, (follower) => follower.follower)
  @JoinTable()
  followers?: FollowerEntity[]

  @OneToMany(() => FollowerEntity, (follower) => follower.following)
  @JoinTable()
  following?: FollowerEntity[]

  @OneToMany(() => BidEntity, (bid) => bid.deal)
  @JoinColumn()
  bids: BidEntity[]

  @OneToMany(() => CouponsEntity, (coupon) => coupon.user)
  @JoinColumn()
  coupons?: CouponsEntity[]

  @OneToMany(() => ReportEntity, (bid) => bid.deal)
  @JoinColumn()
  reports: ReportEntity[]

  @OneToMany(() => BuynowCartEntity, (cart) => cart.user)
  buynow_cart?: BuynowCartEntity[]

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications?: NotificationEntity[]

  @OneToMany(() => WishlistEntity, (wishlist) => wishlist.user)
  wishlists?: WishlistEntity[]

  @OneToMany(() => ActivityReportEntity, (activity_report) => activity_report.user)
  activity_report?: ActivityReportEntity[]

  @OneToMany(() => ActivityReportCommentEntity, (comment) => comment.user)
  activity_report_comments?: ActivityReportCommentEntity[]

  @OneToMany(() => ResellingLinkEntity, (deal_reselling_link) => deal_reselling_link.user)
  reselling_links?: ResellingLinkEntity[]

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  last_login?: Date

  @Column('varchar', { nullable: true })
  zendesk_customer_id?: string

  @Column('varchar', { nullable: true, length: 8, unique: true })
  referral_code?: string

  @OneToMany(() => UserStarsEntity, (star) => star.user)
  stars: UserStarsEntity[]

  @OneToMany(() => PaymentWalletsEntity, (wallet) => wallet.user)
  wallets: PaymentWalletsEntity[]

  @OneToMany(() => PaymentCardsEntity, (card) => card.user)
  cards: PaymentCardsEntity[]

  @OneToMany(() => UserSessionEntity, (session) => session.user)
  sessions: UserSessionEntity[]

  @VirtualColumn({
    query: (alias) => `SELECT COALESCE(COUNT(*), 0)
      FROM "users_followers"
      WHERE
        "followerId" = ${alias}."id" AND "type" = '${FollowType.PROFILE}'`,
  })
  follower_count?: string

  @VirtualColumn({
    query: (alias) => `SELECT COALESCE(COUNT(*), 0)
      FROM "users_followers"
      WHERE
        "followingId" = ${alias}."id" AND "type" = '${FollowType.PROFILE}'`,
  })
  following_count?: string

  @OneToOne(() => EmailChangeEntity, (email_change) => email_change.user)
  @JoinTable()
  email_changes?: EmailChangeEntity

  @VirtualColumn({
    query: (alias) =>
      `${GetDealDonationQuery({
        columnMatchCondition: `"donation"."userId" = ${alias}."id"`,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float as total_amount',
      })}`,
  })
  total_donations?: string

  @VirtualColumn({
    query: (alias) =>
      `${GetDealDonationQuery({
        columnMatchCondition: `"donation"."userId" = ${alias}."id"`,
        select:
          'COALESCE(SUM("donation"."amount" + "donation"."system_fees"), 0)::float as total_amount',
      })}`,
  })
  gross_donations?: string

  @VirtualColumn({
    query: (alias) => `(SELECT
      COALESCE(
        SUM("payment"."deal_amount"),
        0
      )
    FROM
      "user_deal_payment" "payment"
    LEFT JOIN "user_deal_item_payment" "item_payment"
      ON "item_payment"."paymentId" = "payment"."id"
    WHERE
      ${alias}.id = "item_payment"."senderId"
        AND "payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
    )`,
  })
  total_buy?: string

  @VirtualColumn({
    query: (alias) =>
      `${GetUserDealSalesQuery({
        userId: `${alias}."id"`,
        select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
      })}`,
  })
  total_sell?: string

  @Column('json', { default: [] })
  available_tokens: string[]

  @Column('varchar', { default: null })
  prioritised_token: string

  @Column({
    type: 'enum',
    enum: Object.values(UserGrade),
    default: UserGrade.ContributorI,
  })
  grade: UserGrade

  @BeforeInsert()
  @BeforeUpdate()
  public hashPassword = hashMethod.bind(this)

  public comparePassword = compareMethod.bind(this)

  public toResponseObject = toResponseObject.bind(this)
}
