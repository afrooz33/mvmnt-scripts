import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { OrderRoutingType } from '@app/src/users/order-routing/enums'
import { OrderRoutinShippingOriginGroupEntity } from './order-routing-shipping-origin-groups.entity'

@Entity('user_order_routing')
export class OrderRoutingEntity extends MyEntity {
  @Column('enum', {
    enum: Object.values(OrderRoutingType),
    nullable: false,
    default: OrderRoutingType.MINIMIZE_SPLIT_FULFILLMENTS,
  })
  type: OrderRoutingType

  @Column('int', { nullable: false, default: 0 })
  display_order: number

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @OneToMany(
    () => OrderRoutinShippingOriginGroupEntity,
    (origin_group) => origin_group.order_routing,
    { cascade: true },
  )
  @JoinColumn()
  origin_groups: OrderRoutinShippingOriginGroupEntity[]
}
