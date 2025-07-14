import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DeliveryCarrierEntity } from '@app/src/users/delivery-settings/carrier/entities/delivery-carrier.entity'
import { OrderReturnExchangeItemEntity } from './order-return-exchange-item.entity'

@Entity('order_return_shipments')
export class OrderReturnShipmentEntity extends MyEntity {
  @Column({ type: 'varchar', length: 255 })
  tracking_number: string

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  shipped_at: Date

  @ManyToOne(() => DeliveryCarrierEntity, { nullable: false })
  @JoinColumn()
  delivery_carrier: DeliveryCarrierEntity

  @ManyToOne(() => OrderReturnExchangeItemEntity, (item) => item.shipments, { onDelete: 'CASCADE' })
  @JoinColumn()
  return_exchange_item: OrderReturnExchangeItemEntity
}
