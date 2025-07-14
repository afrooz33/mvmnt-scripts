import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { CancellationLogAction } from '@app/src/purchase-history/cancel-order/enums'
import { OrderCancellationEntity } from './order-cancellation.entity'

@Entity('order_cancellation_logs')
export class OrderCancellationLogEntity extends MyEntity {
  @ManyToOne(() => OrderCancellationEntity, (cancellation) => cancellation.logs, {
    nullable: false,
  })
  @JoinColumn()
  cancellation: OrderCancellationEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @Column({
    type: 'enum',
    enum: CancellationLogAction,
    nullable: false,
  })
  action: CancellationLogAction

  @Column({ type: 'jsonb', nullable: true })
  details: any
}
