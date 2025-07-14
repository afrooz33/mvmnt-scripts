import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { ProvinceEntity } from './province.entity'
import { ContinentEntity } from './continent.entity'
import { CountryTranslationEntity } from './country.translation.entity'
import { countryResponseObject } from './methods'
import { ShippingZoneEntity } from '@app/src/users/shipping-profiles/entities/shipping-zones.entity'
import { PostcodeEntity } from './postcode.entity'

@Entity('countries')
@Unique('uq_country', ['name', 'code'])
export class CountryEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string

  @Column({
    type: 'text',
    nullable: false,
  })
  code: string

  @ManyToOne(() => ContinentEntity, (continent) => continent.countries)
  @JoinColumn()
  continent: ContinentEntity

  @OneToMany(() => AddressEntity, (address) => address.country)
  addresses: AddressEntity[]

  @OneToMany(() => CountryTranslationEntity, (translation) => translation.country, {
    cascade: true,
  })
  @JoinColumn()
  translations: CountryTranslationEntity[]

  @OneToMany(() => ProvinceEntity, (province) => province.country, {
    cascade: true,
  })
  @JoinColumn()
  provinces: ProvinceEntity[]

  @OneToMany(() => PostcodeEntity, (postcode) => postcode.country, {
    cascade: true,
  })
  @JoinColumn()
  postcodes: PostcodeEntity[]

  @ManyToMany(() => ShippingZoneEntity, (shippingZone) => shippingZone.countries)
  shipping_zones: ShippingZoneEntity[]

  public toResponseObject = countryResponseObject.bind(this)
}
