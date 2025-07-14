import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DeliveryDaysRange } from '@app/src/users/delivery-settings/dto/properties'
import { DeliveryCarrierEntity } from '@app/src/users/delivery-settings/carrier/entities/delivery-carrier.entity'
import { DeliverySettingsEntity } from './delivery-settings.entity'

@Entity('general_delivery_settings')
export class GeneralDeliverySettingsEntity extends MyEntity {
  @Column('jsonb', { nullable: false })
  delivery_days_range: DeliveryDaysRange

  @Column('time', { nullable: true, default: null })
  order_cut_off_time: string

  @Column('simple-array')
  non_working_days: string[]

  @Column('simple-array')
  holidays: string[]

  @OneToOne(() => DeliveryCarrierEntity, {
    nullable: false,
  })
  @JoinColumn()
  carrier: DeliveryCarrierEntity

  @OneToOne(() => DeliverySettingsEntity, { nullable: false })
  @JoinColumn()
  delivery_settings: DeliverySettingsEntity
}
