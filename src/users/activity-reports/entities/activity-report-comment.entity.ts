import { Column, Entity, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ActivityReportEntity } from '@app/src/users/activity-reports/entities/activity-report.entity'
import { toResponseObject } from './methods'

@Entity('activity_report_comments')
export class ActivityReportCommentEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  comment: string

  @ManyToOne(() => UserEntity, (user) => user.activity_report_comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => ActivityReportEntity, (activity_report) => activity_report.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  activity_report: ActivityReportEntity

  @ManyToOne(() => ActivityReportCommentEntity, (comment) => comment.replies, {
    nullable: true,
  })
  @JoinColumn()
  parent: ActivityReportCommentEntity

  @OneToMany(() => ActivityReportCommentEntity, (comment) => comment.parent)
  replies: ActivityReportCommentEntity[]

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'activity_report_comment_mentions',
  })
  mentioned_users: UserEntity[]

  /**
   * @description Convert the entity to a response object
   * @returns {Record<string, any>} The response object
   */
  public toResponseObject = toResponseObject.bind(this)
}
