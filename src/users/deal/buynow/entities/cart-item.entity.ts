import { ManyToOne, JoinColumn, Entity, Column, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { OrderShippingItemEntity } from '@app/src/sales-history/shipping/entities/order-shipping-item.entity'
import { BuynowCartEntity } from './cart.entity'

@Entity('user_deal_buynow_cart_items')
export class BuynowCartItemEntity extends MyEntity {
  @ManyToOne(() => DealEntity, (deal) => deal.buynow_cart, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  deal: DealEntity

  @ManyToOne(() => DealVariantEntity, (deal_variant) => deal_variant.cart_item, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  variant: DealVariantEntity

  @ManyToOne(() => BuynowCartEntity, (cart) => cart.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cart: BuynowCartEntity

  @Column({
    type: 'numeric',
    nullable: false,
  })
  quantity: number

  @Column({
    type: 'double precision',
    nullable: false,
    default: 0,
  })
  total: number

  @Column({
    type: 'double precision',
    nullable: false,
    default: 0,
  })
  system_fee: number

  @Column({
    type: 'double precision',
    nullable: false,
    default: 0,
  })
  gross_donations: number

  @Column({
    type: 'double precision',
    nullable: false,
    default: 0,
  })
  net_donations: number

  @Column({
    type: 'double precision',
    nullable: false,
    default: 0,
  })
  discount: number

  @Column({
    type: 'text',
    nullable: true,
  })
  delivery_date: string

  @Column({
    type: 'text',
    nullable: true,
  })
  delivery_time_slot: string

  @Column({
    type: 'text',
    nullable: true,
  })
  estimated_delivery_days: string

  @Column({
    type: 'double precision',
    nullable: true,
  })
  shipping_price: number

  /**
   * The shipping profile associated with this cart item.
   * This can be null because when item added to cart we are not checking shipping profile
   * we only find shipping profile when user do checkout to make sure most recent updated profile get applied
   */
  @ManyToOne(() => ShippingProfileEntity, { nullable: true })
  @JoinColumn()
  shipping_profile: ShippingProfileEntity

  @OneToMany(() => OrderShippingItemEntity, (shippingItem) => shippingItem.cart_item)
  shipping_items: OrderShippingItemEntity[]
}
