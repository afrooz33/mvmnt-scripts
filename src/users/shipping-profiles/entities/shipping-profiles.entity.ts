import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { ShippingZoneEntity } from './shipping-zones.entity'

@Entity('shipping_profiles')
export class ShippingProfileEntity extends MyEntity {
  @Column({
    length: 100,
    type: 'varchar',
    nullable: false,
  })
  name: string

  @ManyToMany(() => DealEntity, (deal) => deal.shipping_profiles, {
    cascade: true,
  })
  @JoinTable({
    name: 'shipping_profile_deals',
  })
  deals: DealEntity[]

  @ManyToMany(() => DealVariantEntity, (variant) => variant.shipping_profiles, {
    cascade: true,
  })
  @JoinTable({
    name: 'shipping_profile_variants',
  })
  variants: DealVariantEntity[]

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  all_deals: boolean

  @ManyToMany(() => AddressEntity, (address) => address.shipping_profiles, {
    cascade: true,
  })
  @JoinTable({
    name: 'shipping_profile_origins',
  })
  origins: AddressEntity[]

  @OneToMany(() => ShippingZoneEntity, (zone) => zone.shipping_profile, {
    cascade: true,
  })
  zones: ShippingZoneEntity[]

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(ShippingProfileStatus),
    default: ShippingProfileStatus.ENABLED,
    nullable: false,
  })
  status: ShippingProfileStatus
}
