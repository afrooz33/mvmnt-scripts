import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ShippingPriceEntity } from './shipping-prices.entity'
import { ShippingProfileEntity } from './shipping-profiles.entity'
import { ShippingZoneCountriesEntity } from './shipping-zone-countries.entity'

@Entity('shipping_zones')
export class ShippingZoneEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string

  @OneToMany(() => ShippingZoneCountriesEntity, (country) => country.zone, {
    cascade: true,
  })
  countries: ShippingZoneCountriesEntity[]

  @OneToMany(() => ShippingPriceEntity, (price) => price.zone, {
    cascade: true,
  })
  prices: ShippingPriceEntity[]

  @ManyToOne(() => ShippingProfileEntity, (profile) => profile.zones)
  shipping_profile: ShippingProfileEntity
}
