import { Column, Entity, JoinTable, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { NotificationSettingType } from '@app/src/notifications/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('notification_settings')
@Unique(['user', 'type'])
export class NotificationSettingEntity extends MyEntity {
  @Column({ type: 'boolean', default: true, nullable: false })
  status: boolean

  @Column('enum', {
    enum: Object.values(NotificationSettingType),
    nullable: false,
  })
  type: NotificationSettingType

  @ManyToOne(() => UserEntity, {
    nullable: false,
  })
  @JoinTable()
  user: UserEntity
}
