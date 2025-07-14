import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { ContactSellerMessageEntity } from './contact-seller-message.entity'

@Entity('contact_seller_requests')
export class ContactSellerRequestEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  buyer: UserEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  seller: UserEntity

  @ManyToOne(() => UserDealPaymentEntity, { nullable: false })
  @JoinColumn()
  order: UserDealPaymentEntity

  @ManyToOne(() => BuynowCartEntity, { nullable: true })
  @JoinColumn()
  cart?: BuynowCartEntity

  @ManyToOne(() => BidEntity, { nullable: true })
  @JoinColumn()
  bid?: BidEntity

  @Column({
    type: 'enum',
    enum: ContactRequestStatus,
    default: ContactRequestStatus.PENDING_SELLER_RESPONSE,
  })
  status: ContactRequestStatus

  @OneToMany(() => ContactSellerMessageEntity, (message) => message.request, {
    cascade: true,
  })
  messages: ContactSellerMessageEntity[]

  @Column({ type: 'timestamp with time zone', nullable: true })
  closed_at?: Date
}
