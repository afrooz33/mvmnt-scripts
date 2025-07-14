import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { PostcodeEntity } from '@app/src/admin/geo/entities/postcode.entity'
import { UserAddressType, UserAddressStatus } from '@app/src/users/address/enums'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { ProfileNames } from './properties'
import { toResponseObject } from './methods'

@Entity('user_addressess')
export class AddressEntity extends MyEntity {
  @ManyToOne(() => CountryEntity, (country) => country.addresses, {
    nullable: false,
  })
  @JoinColumn()
  country: CountryEntity

  @ManyToOne(() => ProfileEntity, (profile) => profile.addresses)
  @JoinColumn()
  @JoinTable()
  profile: ProfileEntity

  @Column({ type: 'varchar', length: 100, nullable: false })
  state: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  city: string

  @Column({ type: 'text', nullable: true })
  street: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone_number: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  building: string

  @Column({ type: 'boolean', default: false, nullable: false })
  is_default: boolean

  @Column({ type: 'boolean', default: false, nullable: false })
  is_personal: boolean

  @Column({
    type: 'jsonb',
    nullable: true,
    default: () => "'[]'",
  })
  name: ProfileNames

  @Column({
    type: 'enum',
    enum: Object.values(UserAddressType),
    default: UserAddressType.DELIVERY,
    nullable: false,
  })
  type: UserAddressType

  @Column({
    type: 'enum',
    enum: Object.values(UserAddressStatus),
    default: UserAddressStatus.ENABLED,
    nullable: false,
  })
  status: UserAddressStatus

  @ManyToOne(() => PostcodeEntity, (postcode) => postcode.addresses, {
    nullable: true,
  })
  @JoinColumn()
  postcode: PostcodeEntity

  @ManyToMany(() => ShippingProfileEntity)
  @JoinTable()
  shipping_profiles: ShippingProfileEntity[]

  public toResponseObject = toResponseObject.bind(this)
}
