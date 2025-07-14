import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BusinessType, ShopInfoSettings } from '@app/src/users/user/enums'

@Entity('user_business_shop_info')
export class UserBusinessShopInfoEntity extends MyEntity {
  @Column('enum', {
    enum: Object.values(BusinessType),
    default: BusinessType.SOLE_PROPRIETOR,
    nullable: false,
  })
  business_type: BusinessType

  @Column('enum', {
    enum: Object.values(ShopInfoSettings),
    default: ShopInfoSettings.DEFAULT,
  })
  show_shop_details: ShopInfoSettings

  @OneToOne(() => UserEntity, (user) => user.shop_info)
  @JoinColumn()
  user: UserEntity

  @Column('text', { nullable: true })
  name: string

  @Column('text', { nullable: true })
  person_in_charge: string

  @Column('text', { nullable: true })
  phone_number: string

  @Column('text', { nullable: true })
  address: string

  @Column('text', { nullable: true })
  postcode: string

  @Column('text', { nullable: true })
  policy: string
}
