import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  ManyToMany,
  AfterLoad,
  VirtualColumn,
} from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { GetDonationProjectDonationQuery, GetRe2DonationQuery } from '@app/src/shared/sql'
import { DealStatus } from '@app/src/users/deal/enums'
import { DonationType } from '@app/src/donations/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DonationPreset } from '@app/src/nonprofit/profile/entities/properties'
import { toResponseObject } from '@app/src/nonprofit/donation-projects/entities/methods'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { HistoryEntity } from '@app/src/admin/donation-projects/history/entities/history.entity'
import {
  PostingStatus,
  DonationProjectStatus,
  DonationProjectReviewStatus,
} from '@app/src/nonprofit/donation-projects/enums'

@Entity('donation_projects')
export class DonationProjectEntity extends MyEntity {
  @Column('numeric', { nullable: false })
  display_order: number

  @Column({
    type: 'varchar',
    nullable: false,
    length: 80,
  })
  name: string

  @Column({
    type: 'enum',
    enum: Object.values(PostingStatus),
    default: PostingStatus.DISABLED,
  })
  is_schedule?: PostingStatus

  @Column({
    type: 'enum',
    enum: Object.values(PostingStatus),
    default: PostingStatus.DISABLED,
  })
  is_deadline_enabled?: PostingStatus

  @Column({
    type: 'enum',
    enum: Object.values(PostingStatus),
    default: PostingStatus.DISABLED,
  })
  is_goal_set?: PostingStatus

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  schedule_date?: Date

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  deadline_date?: Date

  @Column({
    type: 'numeric',
    nullable: true,
  })
  goal_amount?: number

  @Column({
    type: 'varchar',
    nullable: false,
    length: 240,
  })
  introduction: string

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  published_date?: Date

  @Column('text', { nullable: true })
  admin_memo: string

  @Column('jsonb', { nullable: true })
  donation_presets: DonationPreset

  @Column({
    type: 'numeric',
    default: 0,
    nullable: false,
  })
  default_donation_preset_amount: string

  @Column({
    type: 'enum',
    enum: Object.values(DonationProjectReviewStatus),
    default: null,
  })
  review_status?: DonationProjectReviewStatus

  @Column({
    type: 'enum',
    enum: Object.values(DonationProjectStatus),
    default: DonationProjectStatus.DRAFT,
  })
  status?: DonationProjectStatus

  @Column({
    type: 'text',
    nullable: true,
  })
  vault_address: string

  @ManyToOne(() => NonprofitUserEntity, (user) => user.donation_projects, {
    nullable: false,
  })
  user: NonprofitUserEntity

  @ManyToMany(() => ImagesEntity, (image) => image.donation_projects)
  @JoinTable()
  images: ImagesEntity[]

  @ManyToMany(() => TagEntity, (tag) => tag.donation_projects)
  @JoinTable()
  tags: TagEntity[]

  @OneToMany(() => HistoryEntity, (history) => history.donation_projects)
  history?: HistoryEntity[]

  @OneToMany(() => DealEntity, (deal) => deal.donation_project)
  deals?: DealEntity[]

  total_deals?: number
  total_active_deals?: number

  @VirtualColumn({
    query: (alias) =>
      `(${GetDonationProjectDonationQuery(alias, 'COALESCE(SUM("donation"."amount"), 0)::float')})`,
  })
  total_donations?: number

  @VirtualColumn({
    query: (alias) =>
      `(${GetDonationProjectDonationQuery(
        alias,
        'COALESCE(SUM("donation"."amount" + "donation"."system_fees"), 0)::float',
      )})`,
  })
  gross_donations?: number

  @VirtualColumn({
    query: (alias) =>
      `(${GetDonationProjectDonationQuery(alias, 'COALESCE(SUM("donation"."amount"), 0)::float', [
        DonationType.AUCTION,
        DonationType.BUYNOW,
        DonationType.RAFFLE,
      ])})`,
  })
  total_deal_donations?: number

  @VirtualColumn({
    query: (alias) =>
      `(${GetDonationProjectDonationQuery(alias, 'COALESCE(SUM("donation"."amount"), 0)::float', [
        DonationType.DIRECT_DONATION,
      ])})`,
  })
  total_direct_donations?: number

  @VirtualColumn({
    query: (alias) =>
      `(${GetDonationProjectDonationQuery(
        alias,
        'COALESCE(COUNT(DISTINCT "donation"."userId"), 0)::int',
      )})`,
  })
  total_donors?: number

  @VirtualColumn({
    query: (alias) =>
      `(${GetRe2DonationQuery({
        id: `${alias}."id"`,
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM("donation"."amount"), 0)::float`,
      })})`,
  })
  total_re2_donations?: number

  @AfterLoad()
  async countTotalDeals() {
    const { count } = await DealEntity.createQueryBuilder('deals')
      .where('deals.donation_project = :id', { id: this.id })
      .select('COUNT(*)', 'count')
      .getRawOne()

    this.total_deals = count
  }

  @AfterLoad()
  async countTotalActiveDeals() {
    const { count } = await DealEntity.createQueryBuilder('deals')
      .where('deals.donation_project = :id', { id: this.id })
      .andWhere('deals.status IN(:...status)', {
        status: [DealStatus.ON_DEAL, DealStatus.SCHEDULED],
      })
      .select('COUNT(*)', 'count')
      .getRawOne()

    this.total_active_deals = count
  }

  public toResponseObject = toResponseObject.bind(this)
}
