import { Column, Entity } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'

@Entity('task_scheduled')
export class TaskSchedulerEntity extends MyEntity {
  @Column('varchar', { length: 255, nullable: false })
  job_id: string

  @Column('varchar', { length: 255, nullable: false })
  name: string

  @Column('jsonb', { nullable: false })
  data: any

  @Column('timestamptz', { nullable: false })
  scheduled_at: Date

  @Column('text', { nullable: true })
  error: string

  @Column('enum', {
    enum: Object.values(TaskScheduleStatus),
    default: TaskScheduleStatus.PENDING,
  })
  status: TaskScheduleStatus
}
