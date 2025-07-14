import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { toResponseObject } from './methods'

@Entity('user_deal_bids')
export class BidEntity extends MyEntity {
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    unsigned: true,
  })
  bid_amount: number

  @Column('smallint', { nullable: false, unsigned: true })
  quantity: number

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    unsigned: true,
  })
  delivery_cost: number

  @Column('date', {
    nullable: true,
    default: null,
  })
  delivery_date: Date

  @Column({
    type: 'text',
    nullable: true,
  })
  delivery_time_slot: string

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    unsigned: true,
  })
  total_amount: number

  @ManyToOne(() => UserEntity, (user) => user.bids, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => DealEntity, (deal) => deal.bids, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn()
  deal: DealEntity

  @Column('enum', {
    enum: Object.values(BidStatus),
    default: BidStatus.PENDING,
    nullable: false,
  })
  status: BidStatus

  @Column('timestamp with time zone', {
    nullable: true,
    default: null,
  })
  purchase_date: Date

  @Column('timestamp with time zone', {
    nullable: true,
    default: null,
  })
  return_deadline: Date

  @Column('text', { nullable: true })
  reject_reason: string

  @Column('timestamp with time zone', {
    nullable: true,
    default: null,
  })
  reject_date: Date

  @Column('timestamp with time zone', {
    nullable: true,
    default: null,
  })
  decline_date: Date

  @ManyToOne(() => CouponsEntity, { nullable: true })
  @JoinColumn()
  coupon: CouponsEntity

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  address: AddressEntity

  public toResponseObject = toResponseObject.bind(this)
}
