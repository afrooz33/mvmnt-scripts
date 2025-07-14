import { Column } from 'typeorm'

export class ShippingFee {
  @Column('smallint', { nullable: false })
  min_amount: number

  @Column('smallint', { nullable: false })
  max_amount: number

  @Column('smallint', { nullable: false })
  fee: number
}
