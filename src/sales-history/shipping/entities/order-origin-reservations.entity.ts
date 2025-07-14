import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { OrderShippingItemEntity } from '@app/src/sales-history/shipping/entities/order-shipping-item.entity'

@Entity('order_origin_reservations')
export class OrderOriginReservationEntity extends MyEntity {
  @ManyToOne(() => BuynowCartEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  cart: BuynowCartEntity

  @ManyToOne(() => BuynowCartItemEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  cart_item: BuynowCartItemEntity

  @ManyToOne(() => BidEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  bid: BidEntity

  @ManyToOne(() => AddressEntity)
  @JoinColumn()
  origin: AddressEntity

  @ManyToOne(() => DealVariantInventoryEntity)
  @JoinColumn()
  inventory: DealVariantInventoryEntity

  @Column({
    type: 'numeric',
    nullable: false,
  })
  quantity: number

  @Column({
    type: 'boolean',
    default: false,
  })
  is_shipped: boolean

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  expires_at: Date

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  shipped_at: Date

  @ManyToOne(() => OrderShippingItemEntity, { nullable: true })
  @JoinColumn()
  shipping_item: OrderShippingItemEntity
}
