import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ShippingZoneEntity } from './shipping-zones.entity'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { ShippingZoneProvincesEntity } from './shipping-zone-provinces.entity'

@Entity('shipping_zone_countries')
export class ShippingZoneCountriesEntity extends MyEntity {
  @ManyToOne(() => CountryEntity, { nullable: false })
  @JoinColumn()
  country: CountryEntity

  @OneToMany(() => ShippingZoneProvincesEntity, (province) => province.shipping_zone_country, {
    cascade: true,
  })
  @JoinColumn()
  shipping_zone_province: ShippingZoneProvincesEntity[]

  @ManyToOne(() => ShippingZoneEntity, (zone) => zone.countries)
  zone: ShippingZoneEntity
}
