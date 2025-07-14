import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { CancellationStatus, GasFeePayer } from '@app/src/purchase-history/cancel-order/enums'
import { OrderCancellationLogEntity } from './order-cancellation-log.entity'
import { OrderCancellationItemEntity } from './order-cancellation-item.entity'

@Entity('order_cancellations')
export class OrderCancellationEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  buyer: UserEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  seller: UserEntity

  @ManyToOne(() => BuynowCartEntity, { nullable: true })
  @JoinColumn()
  cart: BuynowCartEntity

  @ManyToOne(() => BidEntity, { nullable: true })
  @JoinColumn()
  bid: BidEntity

  @Column({
    type: 'enum',
    enum: CancellationStatus,
    default: CancellationStatus.REQUESTED,
  })
  status: CancellationStatus

  @Column({ type: 'timestamp', nullable: false })
  requested_at: Date

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date

  @Column({ type: 'timestamp', nullable: true })
  refunded_at: Date

  @Column({ type: 'varchar', nullable: true })
  refund_id: string

  @Column({ type: 'decimal', precision: 24, scale: 12, nullable: true })
  refund_amount: number

  @Column({ type: 'decimal', precision: 24, scale: 12, nullable: true })
  refund_amount_in_token: number

  @Column({ type: 'varchar', nullable: true })
  token_symbol: string

  @Column({ type: 'varchar', nullable: true })
  refund_from_wallet: string

  @Column({ type: 'varchar', nullable: true })
  refund_to_wallet: string

  @Column({ type: 'varchar', nullable: true })
  refund_transaction_id: string

  @Column({
    type: 'enum',
    enum: GasFeePayer,
    nullable: true,
  })
  gas_fee_payer: GasFeePayer

  @Column({ type: 'text', nullable: true })
  seller_notes: string

  @OneToMany(() => OrderCancellationItemEntity, (item) => item.cancellation, { cascade: true })
  items: OrderCancellationItemEntity[]

  @OneToMany(() => OrderCancellationLogEntity, (log) => log.cancellation, { cascade: true })
  logs: OrderCancellationLogEntity[]
}
