import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import {
  ReturnExchangeReason,
  ReturnExchangeStatus,
} from '@app/src/purchase-history/refund-exchange/enums'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderReturnExchangeEntity } from './order-return-exchange.entity'
import { OrderReturnShipmentEntity } from './order-return-shipment.entity'

@Entity('order_return_exchange_items')
export class OrderReturnExchangeItemEntity extends MyEntity {
  @Column({ type: 'integer', nullable: false })
  quantity_requested: number

  @Column({ type: 'enum', enum: ReturnExchangeReason, nullable: false })
  reason: ReturnExchangeReason

  @Column({ type: 'text', nullable: true })
  notes?: string

  @Column({
    type: 'enum',
    enum: ReturnExchangeStatus,
    default: ReturnExchangeStatus.REQUESTED,
  })
  status: ReturnExchangeStatus

  @Column({ type: 'integer', nullable: true })
  approved_quantity?: number

  @Column({ type: 'integer', nullable: true })
  shipped_quantity?: number

  @Column({ type: 'timestamp with time zone', nullable: true })
  approved_at?: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  rejected_at?: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  closed_at?: Date

  @ManyToOne(() => OrderReturnExchangeEntity, (main) => main.items, { onDelete: 'CASCADE' })
  @JoinColumn()
  return_exchange: OrderReturnExchangeEntity

  @ManyToOne(() => BuynowCartItemEntity, { nullable: true })
  @JoinColumn()
  cart_item: BuynowCartItemEntity

  @ManyToOne(() => BidEntity, { nullable: true })
  @JoinColumn()
  bid: BidEntity

  @OneToMany(() => OrderReturnShipmentEntity, (shipment) => shipment.return_exchange_item)
  shipments: OrderReturnShipmentEntity[]
}
