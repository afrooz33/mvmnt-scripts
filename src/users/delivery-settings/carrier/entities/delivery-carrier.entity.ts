import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DeliverySettingStatus } from '@app/src/users/delivery-settings/enums'

@Entity('delivery_carrier')
export class DeliveryCarrierEntity extends MyEntity {
  @Column()
  name: string

  @Column('text', { array: true, nullable: true })
  time_slot: string[]

  @Column({
    type: 'enum',
    enum: DeliverySettingStatus,
    default: DeliverySettingStatus.ENABLED,
  })
  status: DeliverySettingStatus

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity
}
