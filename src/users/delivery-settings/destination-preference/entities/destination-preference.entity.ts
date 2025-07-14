import { Entity, JoinColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { DeliverySettingsEntity } from '@app/src/users/delivery-settings/entities/delivery-settings.entity'
import { DestinationCountryEntity } from './destination-country.entity'

@Entity('delivery_destination_preferences')
export class DestinationPreferenceEntity extends MyEntity {
  @ManyToOne(() => UserEntity, {
    nullable: false,
  })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => DeliverySettingsEntity, { nullable: false })
  @JoinColumn()
  delivery_settings: DeliverySettingsEntity

  @ManyToMany(() => ShippingProfileEntity, { nullable: false })
  @JoinTable()
  shipping_profiles: ShippingProfileEntity[]

  @ManyToMany(() => AddressEntity, { nullable: false })
  @JoinTable()
  origins: AddressEntity[]

  @OneToMany(() => DestinationCountryEntity, (setting) => setting.destination_preference, {
    cascade: true,
  })
  countries: DestinationCountryEntity[]
}
