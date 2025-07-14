import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ProvinceEntity } from '@app/src/admin/geo/entities/province.entity'
import { ShippingZoneCountriesEntity } from './shipping-zone-countries.entity'

@Entity('shipping_zone_provinces')
export class ShippingZoneProvincesEntity extends MyEntity {
  @ManyToOne(() => ProvinceEntity, { nullable: false })
  @JoinColumn()
  province: ProvinceEntity

  @ManyToOne(() => ShippingZoneCountriesEntity, { nullable: false })
  @JoinColumn()
  shipping_zone_country: ShippingZoneCountriesEntity
}
