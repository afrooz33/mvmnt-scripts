import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { PurchaseStatus } from '@app/src/users/deal/raffle-purchase/enums'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { toResponseObject } from './methods'

@Entity('user_deal_raffle_purchases')
export class RafflePurchaseEntity extends MyEntity {
  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    unsigned: true,
  })
  raffle_ticket_price: number

  @Column('smallint', { nullable: false, unsigned: true })
  quantity: number

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: false,
    unsigned: true,
  })
  total_amount: number

  @ManyToOne(() => UserEntity, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => DealEntity, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn()
  deal: DealEntity

  @Column('enum', {
    enum: Object.values(PurchaseStatus),
    nullable: false,
    default: PurchaseStatus.INITIATED,
  })
  status: PurchaseStatus

  @ManyToOne(() => CouponsEntity, { nullable: true })
  @JoinColumn()
  coupon: CouponsEntity

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  address: AddressEntity

  @Column('boolean', { nullable: false, default: false })
  is_free_entry: boolean

  public toResponseObject = toResponseObject.bind(this)
}
