import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ShippingStatus } from '@app/src/sales-history/shipping/enums'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { OrderShippingItemEntity } from './order-shipping-item.entity'
import { OrderShippingTrackingEntity } from './order-shipping-tracking.entity'

@Entity('order_shippings')
export class OrderShippingEntity extends MyEntity {
  @Column({ type: 'text', nullable: true })
  buyer_message: string

  @Column({ type: 'text', nullable: true })
  internal_message: string

  @Column({
    type: 'enum',
    enum: ShippingStatus,
    default: ShippingStatus.PENDING,
  })
  status: ShippingStatus

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  seller: UserEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  buyer: UserEntity

  @ManyToOne(() => UserDealPaymentEntity)
  @JoinColumn()
  payment: UserDealPaymentEntity

  @ManyToOne(() => BuynowCartEntity, { nullable: true })
  @JoinColumn()
  cart?: BuynowCartEntity

  @ManyToOne(() => BidEntity, { nullable: true })
  @JoinColumn()
  bid?: BidEntity

  @ManyToOne(() => AddressEntity)
  @JoinColumn()
  delivery_address: AddressEntity

  @ManyToOne(() => AddressEntity)
  @JoinColumn()
  return_address: AddressEntity

  @OneToMany(() => OrderShippingItemEntity, (item) => item.shipping, { cascade: true })
  items: OrderShippingItemEntity[]

  @OneToMany(() => OrderShippingTrackingEntity, (tracking) => tracking.shipping, {
    cascade: true,
  })
  tracking_details: OrderShippingTrackingEntity[]
}
