import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'

@Entity('user_contact')
export class ContactEntity extends MyEntity {
  @ManyToOne(() => UserEntity, {
    nullable: true,
    cascade: true,
  })
  user: UserEntity

  @ManyToOne(() => UserEntity, {
    nullable: true,
    cascade: true,
  })
  receiver: UserEntity

  @ManyToOne(() => DealEntity, {
    nullable: true,
    cascade: true,
  })
  deal: DealEntity

  @ManyToOne(() => BuynowCartEntity, {
    nullable: true,
    cascade: true,
  })
  cart: BuynowCartEntity

  @ManyToOne(() => UserDealPaymentEntity, {
    nullable: true,
    cascade: true,
  })
  payment: UserDealPaymentEntity

  @ManyToOne(() => BidEntity, {
    nullable: true,
    cascade: true,
  })
  bid: BidEntity

  @Column({ nullable: false, type: 'varchar', length: 20 })
  zendesk_ticket_id: string

  @Column({ nullable: false, default: false, type: 'boolean' })
  sender_read: boolean

  @Column({ nullable: false, default: false, type: 'boolean' })
  receiver_read: boolean

  @Column({ nullable: true, type: 'varchar', length: 255 })
  email: string

  @Column({ nullable: true, type: 'varchar', length: 255 })
  name: string

  @Column({ nullable: true, type: 'text' })
  latest_comment: string
}
