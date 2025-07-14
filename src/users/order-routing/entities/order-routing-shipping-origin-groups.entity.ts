import { Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { OrderRoutingEntity } from './order-routing.entity'
import { OrderRoutinShippingOriginEntity } from './order-routing-shipping-origins.entity'

@Entity('user_order_routing_shipping_origin_groups')
export class OrderRoutinShippingOriginGroupEntity extends MyEntity {
  @ManyToOne(() => OrderRoutingEntity)
  @JoinColumn()
  order_routing: OrderRoutingEntity

  @OneToMany(() => OrderRoutinShippingOriginEntity, (shipping_origin) => shipping_origin.group, {
    cascade: true,
  })
  @JoinTable()
  origins: OrderRoutinShippingOriginEntity[]
}
