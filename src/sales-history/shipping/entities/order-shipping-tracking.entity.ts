import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DeliveryCarrierEntity } from '@app/src/users/delivery-settings/carrier/entities/delivery-carrier.entity'
import { OrderShippingEntity } from './order-shipping.entity'

@Entity('order_shipping_tracking')
export class OrderShippingTrackingEntity extends MyEntity {
  @Column({ type: 'text', nullable: false })
  tracking_number: string

  @ManyToOne(() => DeliveryCarrierEntity, { nullable: true })
  @JoinColumn()
  delivery_carrier: DeliveryCarrierEntity

  @ManyToOne(() => OrderShippingEntity, (shipping) => shipping.tracking_details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  shipping: OrderShippingEntity
}
