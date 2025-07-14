import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ProvinceEntity } from '@app/src/admin/geo/entities/province.entity'
import { DestinationCountryEntity } from './destination-country.entity'

@Entity('delivery_destination_provinces')
export class DestinationProvinceEntity extends MyEntity {
  @Column('smallint', { nullable: false, default: 0 })
  earliest_days: number

  @ManyToOne(() => ProvinceEntity, { nullable: false })
  @JoinColumn()
  province: ProvinceEntity

  @ManyToOne(() => DestinationCountryEntity, { nullable: false })
  @JoinColumn()
  destination_country: DestinationCountryEntity
}
