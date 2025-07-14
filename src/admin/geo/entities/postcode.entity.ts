import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { CountryEntity } from './country.entity'

@Entity('postcodes')
@Unique(['country', 'postcode'])
export class PostcodeEntity extends MyEntity {
  @ManyToOne(() => CountryEntity, (country) => country.postcodes)
  @JoinColumn()
  country: CountryEntity

  @Column({ nullable: false })
  postcode: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  state: string

  @Column({ nullable: true })
  place: string

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number

  @OneToMany(() => AddressEntity, (address) => address.postcode)
  addresses: AddressEntity
}
