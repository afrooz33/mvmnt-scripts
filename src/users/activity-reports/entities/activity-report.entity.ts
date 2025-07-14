import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ActivityReportStatus } from '@app/src/users/activity-reports/enums'
import { ActivityReportAssetsEntity } from './activity-report-assets.entity'
import { ActivityReportCommentEntity } from './activity-report-comment.entity'
import { ActivityReportBookmarkEntity } from './activity-report-bookmark.entity'

@Entity('activity_reports')
export class ActivityReportEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  content: string

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(ActivityReportStatus),
    default: ActivityReportStatus.DRAFT,
  })
  status: ActivityReportStatus

  @ManyToOne(() => UserEntity, (user) => user.activity_report, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity

  @ManyToMany(() => ActivityReportAssetsEntity)
  @JoinTable({
    name: 'activity_reports_assets',
  })
  assets: ActivityReportAssetsEntity[]

  @OneToMany(() => ActivityReportCommentEntity, (comment) => comment.activity_report)
  comments?: ActivityReportCommentEntity

  @OneToMany(() => ActivityReportBookmarkEntity, (bookmark) => bookmark.activity_report)
  bookmarks?: ActivityReportBookmarkEntity
}
