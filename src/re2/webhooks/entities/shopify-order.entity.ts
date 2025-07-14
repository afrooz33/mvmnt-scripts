import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Entity('re2_shopify_orders')
export class ShopifyOrderEntity extends MyEntity {
  @Column('bigint', { nullable: false })
  order_id: number

  @Column('bigint', { nullable: false })
  product: number

  @Column('bigint', { nullable: false })
  variant: number

  @Column('text', { nullable: false })
  shop: string

  @Column('text', { nullable: false })
  email: string

  @Column('varchar', { nullable: false, length: 10 })
  currency: string

  @Column('smallint', { nullable: false })
  total_quantity: number

  @Column('decimal', { nullable: false, default: 0, precision: 10, scale: 2 })
  total_amount: number

  @Column('text', { nullable: false })
  status: string

  @Column('timestamp', { nullable: false })
  max_cancel_date: Date

  @ManyToOne(() => NonprofitUserEntity, { nullable: true })
  @JoinColumn()
  nonprofit?: NonprofitUserEntity

  @ManyToOne(() => DonationProjectEntity, { nullable: true })
  @JoinColumn()
  donation_project?: DonationProjectEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity
}
