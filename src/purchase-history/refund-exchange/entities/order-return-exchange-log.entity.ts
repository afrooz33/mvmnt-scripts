import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { OrderReturnExchangeEntity } from './order-return-exchange.entity'
import { ReturnExchangeLogAction } from '@app/src/purchase-history/refund-exchange/enums'

@Entity('order_return_exchange_logs')
export class OrderReturnExchangeLogEntity extends MyEntity {
  @ManyToOne(() => OrderReturnExchangeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  return_exchange: OrderReturnExchangeEntity

  // User who initiated the action (buyer or seller)
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @Column({ type: 'enum', enum: ReturnExchangeLogAction })
  action: ReturnExchangeLogAction

  // Store details, like quantity, status, etc. as JSON
  @Column('jsonb', { nullable: true })
  details: any

  @CreateDateColumn()
  timestamp: Date
}
