import BigNumber from 'bignumber.js'
import { Entity, ManyToOne, Column } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'

@Entity('user_wallet_balances')
export class WalletBalanceEntity extends MyEntity {
  @ManyToOne(() => PaymentWalletsEntity, { nullable: false })
  payment_wallet: PaymentWalletsEntity

  @Column({
    type: 'decimal',
    precision: 78,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
    nullable: false,
  })
  balance: BigNumber
}
