import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import {
  CancellationReason,
  CancellationStatus,
} from '@app/src/purchase-history/cancel-order/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderCancellationEntity } from './order-cancellation.entity'

@Entity('order_cancellation_items')
export class OrderCancellationItemEntity extends MyEntity {
  @ManyToOne(() => OrderCancellationEntity, (cancellation) => cancellation.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cancellation: OrderCancellationEntity

  @ManyToOne(() => BuynowCartItemEntity, { nullable: true })
  @JoinColumn()
  cart_item: BuynowCartItemEntity

  @ManyToOne(() => DealEntity, { nullable: true })
  @JoinColumn()
  deal: DealEntity

  @Column({ type: 'int', nullable: false })
  quantity_to_cancel: number

  @Column({ type: 'int', nullable: true })
  approved_quantity: number

  @Column({
    type: 'enum',
    enum: CancellationReason,
    nullable: false,
  })
  reason: CancellationReason

  @Column({
    type: 'enum',
    enum: CancellationStatus,
    default: CancellationStatus.REQUESTED,
  })
  status: CancellationStatus
}
