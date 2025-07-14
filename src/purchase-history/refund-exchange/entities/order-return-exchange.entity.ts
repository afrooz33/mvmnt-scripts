import { Entity, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import {
  ReturnExchangeType,
  ReturnProcessOption,
  ReturnExchangeStatus,
  ReturnShippingFeeResponsibility,
} from '@app/src/purchase-history/refund-exchange/enums'
import { OrderReturnRefundEntity } from './order-return-refunds.entity'
import { OrderReturnExchangeLogEntity } from './order-return-exchange-log.entity'
import { OrderReturnExchangeItemEntity } from './order-return-exchange-item.entity'

@Entity('order_return_exchange')
export class OrderReturnExchangeEntity extends MyEntity {
  @Column({ type: 'enum', enum: ReturnExchangeType })
  type: ReturnExchangeType

  @Column({ type: 'enum', enum: ReturnExchangeStatus, default: ReturnExchangeStatus.REQUESTED })
  status: ReturnExchangeStatus

  @CreateDateColumn()
  requested_at: Date

  @Column({ type: 'text', nullable: true })
  notes_to_seller?: string

  @Column({ type: 'enum', enum: ReturnShippingFeeResponsibility, nullable: true })
  shipping_fee_responsibility?: ReturnShippingFeeResponsibility

  @Column({
    type: 'enum',
    enum: ReturnShippingFeeResponsibility,
    default: ReturnShippingFeeResponsibility.BUYER,
  })
  refund_gas_fee_payer: ReturnShippingFeeResponsibility

  @Column({
    type: 'enum',
    enum: ReturnProcessOption,
    default: ReturnProcessOption.RETURN_AND_REFUND,
  })
  process_option: ReturnProcessOption

  @Column({ type: 'text', nullable: true })
  message_to_requester?: string

  @Column({ type: 'text', nullable: true })
  internal_notes?: string

  @Column({ type: 'boolean', default: false })
  is_wishlist_gift: boolean

  @Column({ type: 'timestamp with time zone', nullable: true })
  processed_at?: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at?: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelled_at?: Date

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn()
  seller: UserEntity

  @ManyToOne(() => UserEntity, { eager: false })
  @JoinColumn()
  buyer: UserEntity

  @ManyToOne(() => BuynowCartEntity, { eager: false, nullable: true })
  @JoinColumn()
  cart?: BuynowCartEntity

  @ManyToOne(() => BidEntity, { eager: false, nullable: true })
  @JoinColumn()
  bid?: BidEntity

  @ManyToOne(() => AddressEntity, { eager: false, nullable: true })
  @JoinColumn()
  return_address?: AddressEntity

  @OneToMany(() => OrderReturnExchangeItemEntity, (item) => item.return_exchange, { cascade: true })
  items: OrderReturnExchangeItemEntity[]

  @OneToMany(() => OrderReturnRefundEntity, (refund) => refund.return_exchange, { cascade: true })
  refunds: OrderReturnRefundEntity[]

  @OneToMany(() => OrderReturnExchangeLogEntity, (log) => log.return_exchange, { cascade: true })
  logs: OrderReturnExchangeLogEntity[]
}
