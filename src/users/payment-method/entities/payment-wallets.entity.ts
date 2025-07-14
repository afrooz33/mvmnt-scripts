import { MyEntity } from '@app/src/shared/base'
import { Column, Entity, ManyToOne } from 'typeorm'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { PaymentMethodStatus, WalletType } from '@app/src/users/payment-method/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

@Entity('payment_wallets')
export class PaymentWalletsEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.wallets, { nullable: true })
  user: UserEntity

  @ManyToOne(() => NonprofitUserEntity, (nonprofit) => nonprofit.wallets, { nullable: true })
  nonprofit: NonprofitUserEntity

  @ManyToOne(() => Re2UserEntity, (re2) => re2.wallets, { nullable: true })
  re2: Re2UserEntity

  @ManyToOne(() => AdminUserEntity, (admin) => admin.wallets, { nullable: true })
  admin: AdminUserEntity

  @Column({ type: 'varchar', length: 50 })
  address: string

  @Column('enum', {
    enum: Object.values(PaymentMethodStatus),
    default: PaymentMethodStatus.ACTIVE,
    nullable: false,
  })
  status: PaymentMethodStatus

  @Column('enum', {
    enum: Object.values(WalletType),
    default: WalletType.EOA,
    nullable: false,
  })
  type: WalletType

  @Column('boolean', { default: false, nullable: false })
  is_internal: boolean

  @Column({ type: 'boolean', default: false })
  is_verified: boolean

  @Column({ type: 'boolean', default: false })
  is_default: boolean

  @Column({ type: 'timestamptz', nullable: true })
  verification_expiry: Date
}
