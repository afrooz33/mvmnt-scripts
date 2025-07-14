import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ProductTagSettingsEntity } from '@app/src/users/delivery-settings/product-tag/entities/product-tag-settings.entity'
import { DestinationPreferenceEntity } from '@app/src/users/delivery-settings/destination-preference/entities/destination-preference.entity'
import { UnattendedSettingEntity } from './unattended-settings.entity'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { GeneralDeliverySettingsEntity } from './general-delivery-settings.entity'

@Unique(['user', 'type'])
@Entity('delivery_settings')
export class DeliverySettingsEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @Column('enum', {
    enum: DeliverySettingsType,
    default: DeliverySettingsType.GENERAL,
    nullable: false,
  })
  type: DeliverySettingsType

  @Column('boolean', { default: true, nullable: false })
  is_enabled: boolean

  @OneToOne(() => GeneralDeliverySettingsEntity, (settings) => settings.delivery_settings, {
    cascade: true,
  })
  @JoinTable()
  general_settings: GeneralDeliverySettingsEntity

  @OneToMany(() => UnattendedSettingEntity, (settings) => settings.delivery_settings, {
    cascade: true,
  })
  @JoinColumn()
  unattended_settings: UnattendedSettingEntity

  @OneToMany(() => ProductTagSettingsEntity, (settings) => settings.delivery_settings, {
    cascade: true,
  })
  @JoinColumn()
  product_tag_settings: ProductTagSettingsEntity

  @OneToMany(() => DestinationPreferenceEntity, (settings) => settings.delivery_settings, {
    cascade: true,
  })
  @JoinColumn()
  preference_by_destination: DestinationPreferenceEntity[]
}
