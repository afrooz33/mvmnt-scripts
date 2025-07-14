import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import {
  NotificationType,
  NotificationStatus,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

@Entity('notifications')
export class NotificationEntity extends MyEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string

  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    nullable: true,
  })
  user?: UserEntity

  @Column('simple-json', { nullable: false, default: {} })
  data: any

  @Column('enum', {
    enum: Object.values(NotificationType),
    nullable: false,
  })
  type: NotificationType

  @Column('enum', {
    enum: Object.values(NotificationReceiverType),
    nullable: false,
    default: NotificationReceiverType.USER,
  })
  receiver_type: NotificationReceiverType

  @Column('enum', {
    enum: Object.values(NotificationRelatedTo),
    nullable: false,
    default: NotificationRelatedTo.USER,
  })
  related_to: NotificationRelatedTo

  @Column('enum', {
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.UNREAD,
    nullable: false,
  })
  status: NotificationStatus

  @ManyToOne(() => NonprofitUserEntity, {
    nullable: true,
  })
  nonprofit?: NonprofitUserEntity
}
