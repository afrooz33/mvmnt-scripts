import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ActivityReportEntity } from '@app/src/users/activity-reports/entities/activity-report.entity'

@Entity('activity_report_bookmarks')
@Unique(['user', 'activity_report'])
export class ActivityReportBookmarkEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => ActivityReportEntity, (report) => report.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn()
  activity_report: ActivityReportEntity
}
