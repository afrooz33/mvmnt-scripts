import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { OrderReturnExchangeEntity } from './order-return-exchange.entity'
import { RefundStatus } from '@app/src/purchase-history/refund-exchange/enums'

@Entity('order_return_refunds')
export class OrderReturnRefundEntity extends MyEntity {
  @ManyToOne(() => OrderReturnExchangeEntity, (returnExchange) => returnExchange.refunds, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  return_exchange: OrderReturnExchangeEntity

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  fees_refund: number

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  total_refund: number

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  max_refundable: number

  @Column({ type: 'enum', enum: RefundStatus, default: RefundStatus.PENDING })
  status: RefundStatus

  @Column({ type: 'text', nullable: true })
  transaction_hash?: string

  @Column({ type: 'jsonb', nullable: true })
  transaction_details?: any

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  gas_fee?: number

  @Column({ type: 'text', nullable: true })
  additional_refund_reason?: string

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  processed_by: UserEntity

  @Column({ type: 'timestamp with time zone', nullable: true })
  processed_at?: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  failed_at?: Date
}
