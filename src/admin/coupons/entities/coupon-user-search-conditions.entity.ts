import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { Fields, Conditions } from '@app/src/admin/coupons/enums'
import { CouponsEntity } from './coupons.entity'

@Entity('coupon_search_conditions')
export class CouponUserSearchConditionsEntity extends MyEntity {
  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(Fields),
  })
  field: Fields

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(Conditions),
  })
  condition: Conditions

  @Column({
    type: 'text',
    nullable: false,
  })
  values: string

  @ManyToOne(() => CouponsEntity, (coupon) => coupon.user_search_conditions)
  coupon: CouponsEntity
}
