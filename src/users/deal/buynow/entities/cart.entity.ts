import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { WishlistEntity } from '@app/src/users/wishlist/entities/wishlist.entity'
import { OrderOriginReservationEntity } from '@app/src/sales-history/shipping/entities/order-origin-reservations.entity'
import { BuynowCartItemEntity } from './cart-item.entity'
import { toResponseObject } from './methods'

@Entity('user_deal_buynow_cart')
export class BuynowCartEntity extends MyEntity {
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
  total_discount: number

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

  @Column('enum', {
    enum: Object.values(CartStatus),
    default: CartStatus.PENDING,
    nullable: false,
  })
  status: CartStatus

  @Column('varchar', {
    nullable: true,
    length: 100,
  })
  guestCartId: string

  @Column('boolean', {
    default: false,
  })
  is_anonymous: boolean

  @ManyToOne(() => UserEntity, (user) => user.buynow_cart, {
    nullable: true,
  })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  seller: UserEntity

  @OneToMany(() => BuynowCartItemEntity, (cart_item) => cart_item.cart, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  items: BuynowCartItemEntity[]

  @ManyToOne(() => CouponsEntity, { nullable: true })
  @JoinColumn()
  coupon: CouponsEntity

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  delivery_address: AddressEntity

  @Column('timestamp with time zone', {
    nullable: true,
  })
  purchase_date: Date

  @Column('timestamp with time zone', {
    nullable: true,
  })
  return_deadline: Date

  @ManyToOne(() => WishlistEntity, { nullable: true })
  @JoinColumn()
  wishlist: WishlistEntity

  @Column('timestamp with time zone', {
    nullable: true,
  })
  expires_at: Date

  @OneToMany(() => OrderOriginReservationEntity, (reservation) => reservation.cart, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  reservations: OrderOriginReservationEntity[]

  public toResponseObject = toResponseObject.bind(this)
}
