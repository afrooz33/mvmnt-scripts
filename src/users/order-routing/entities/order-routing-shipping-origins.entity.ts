import { Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { OrderRoutinShippingOriginGroupEntity } from './order-routing-shipping-origin-groups.entity'

@Entity('user_order_routing_shipping_origins')
export class OrderRoutinShippingOriginEntity extends MyEntity {
  @ManyToOne(() => OrderRoutinShippingOriginGroupEntity)
  @JoinColumn()
  group: OrderRoutinShippingOriginGroupEntity

  @ManyToOne(() => AddressEntity)
  @JoinColumn()
  origin: AddressEntity
}
