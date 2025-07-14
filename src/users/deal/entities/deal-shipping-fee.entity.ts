import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

@Entity('deal_shipping_fees')
export class DealShippingFeeEntity extends MyEntity {
  @Column('smallint', { nullable: false, default: 0, unsigned: true })
  min_amount: number

  @Column('smallint', { nullable: true, unsigned: true })
  max_amount: number

  @Column('smallint', { nullable: false, default: 0, unsigned: true })
  fee: number

  @ManyToOne(() => DealEntity, (deal) => deal.shipping_fee)
  @JoinColumn()
  deal: DealEntity
}
