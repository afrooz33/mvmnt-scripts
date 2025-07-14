import { Check, Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ReviewReportEntity } from './review-report.entity'

@Entity('user_deal_review')
export class DealReviewEntity extends MyEntity {
  @ManyToOne(() => DealEntity, (deal) => deal.reviews)
  @JoinTable()
  deal: DealEntity

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  @JoinTable()
  user: UserEntity

  @Column('text', { nullable: true, default: null })
  description: string

  @Check('rating >= 1 AND rating <= 5')
  @Column('smallint', { nullable: false, default: 1 })
  rating: number

  @Column('enum', {
    enum: Object.values(DealRatingStatus),
    default: DealRatingStatus.ENABLED,
  })
  status: DealRatingStatus

  @OneToMany(() => ReviewReportEntity, (report) => report.review, {
    cascade: true,
  })
  @JoinColumn()
  reports?: ReviewReportEntity[]
}
