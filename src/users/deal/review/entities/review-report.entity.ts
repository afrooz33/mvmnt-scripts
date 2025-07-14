import { Column, Entity, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealReviewEntity } from './review.entity'

@Entity('user_deal_review_reports')
export class ReviewReportEntity extends MyEntity {
  @ManyToOne(() => DealReviewEntity, (review) => review.reports)
  @JoinTable()
  review: DealReviewEntity

  @ManyToOne(() => UserEntity, (user) => user.reviews)
  @JoinTable()
  user: UserEntity

  @Column('text', { nullable: true, default: null })
  description: string
}
