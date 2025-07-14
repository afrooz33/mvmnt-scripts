import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderShippingEntity } from './order-shipping.entity'

@Entity('order_shipping_items')
export class OrderShippingItemEntity extends MyEntity {
  @ManyToOne(() => BuynowCartItemEntity, (cartItem) => cartItem.shipping_items, {
    nullable: true,
  })
  @JoinColumn()
  cart_item?: BuynowCartItemEntity

  @ManyToOne(() => BidEntity, {
    nullable: true,
  })
  @JoinColumn()
  bid?: BidEntity

  @Column()
  quantity: number

  @Column({ nullable: true })
  shipped_at: Date

  @ManyToOne(() => OrderShippingEntity, (shipping) => shipping.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  shipping: OrderShippingEntity
}
