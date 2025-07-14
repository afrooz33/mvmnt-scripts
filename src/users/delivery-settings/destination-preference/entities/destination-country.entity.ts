import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { DestinationProvinceEntity } from './destination-province.entity'
import { DestinationPreferenceEntity } from './destination-preference.entity'

@Entity('delivery_destination_countries')
export class DestinationCountryEntity extends MyEntity {
  @Column('smallint', { nullable: false, default: 0 })
  earliest_days: number

  @ManyToOne(() => CountryEntity, { nullable: false })
  @JoinColumn()
  country: CountryEntity

  @OneToMany(() => DestinationProvinceEntity, (province) => province.destination_country, {
    cascade: true,
  })
  @JoinColumn()
  destination_province: DestinationProvinceEntity[]

  @ManyToOne(() => DestinationPreferenceEntity, (settings) => settings.countries, {
    nullable: false,
  })
  @JoinColumn()
  destination_preference: DestinationPreferenceEntity
}
