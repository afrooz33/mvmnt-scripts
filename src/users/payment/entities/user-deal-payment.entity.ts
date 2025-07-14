import BigNumber from 'bignumber.js'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { DealType } from '@app/src/users/deal/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums/payment-status.enum'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { UserDealItemPaymentEntity } from './user-deal-item-payment.entity'

@Entity('user_deal_payment')
export class UserDealPaymentEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @OneToMany(() => UserDealItemPaymentEntity, (item) => item.payment, {
    cascade: true,
  })
  items: UserDealItemPaymentEntity[]

  @ManyToOne(() => PaymentWalletsEntity)
  buyer_wallet: PaymentWalletsEntity

  @ManyToOne(() => PaymentWalletsEntity)
  seller_wallet: PaymentWalletsEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  deal_amount: BigNumber

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  donation_amount: BigNumber

  @Column({
    type: 'enum',
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.INITIATED,
  })
  status: PAYMENT_STATUS

  @Column({
    type: 'enum',
    enum: Object.values(DealType),
  })
  deal_type: DealType

  @Column('boolean', { default: false })
  dex_required: boolean

  @Column('boolean', { default: false })
  ramping_required: boolean

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  gas_fees: BigNumber

  @Column('text', { nullable: true })
  transaction_hash: string

  @ManyToOne(() => TokenWhitelistEntity)
  payment_currency: TokenWhitelistEntity

  @ManyToOne(() => BuynowCartEntity, (cart) => cart.id, { nullable: true })
  @JoinColumn()
  cart: BuynowCartEntity

  @ManyToOne(() => RafflePurchaseEntity, { nullable: true })
  @JoinColumn()
  raffle_purchase: RafflePurchaseEntity

  @ManyToOne(() => BidEntity, (bid) => bid.id, { nullable: true })
  @JoinColumn()
  bid: BidEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  points_used: BigNumber
}
