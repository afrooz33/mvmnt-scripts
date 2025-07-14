import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DeliverySettingsEntity } from './delivery-settings.entity'

@Unique(['location', 'delivery_settings'])
@Entity('unattended_delivery_settings')
export class UnattendedSettingEntity extends MyEntity {
  @Column('text', { nullable: false })
  location: string

  @ManyToOne(() => DeliverySettingsEntity, { nullable: false })
  @JoinColumn()
  delivery_settings: DeliverySettingsEntity
}
