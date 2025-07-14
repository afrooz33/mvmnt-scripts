import { Column, BeforeInsert, BeforeUpdate, Entity, OneToOne, JoinTable, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AccountStatus, AdminRole } from '@app/src/admin/user/enums'
import { AdminProfileEntity } from '@app/src/admin/profile/entities/profile.entity'
import { hashMethod, compareMethod } from '@app/src/shared/entities/methods'
import { toResponseObject } from '@app/src/admin/user/entities/methods'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'

@Entity('admins')
export class AdminUserEntity extends MyEntity {
  @Column({
    type: 'text',
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
    unique: true,
  })
  email: string

  @Column('text')
  password: string

  @Column({
    type: 'enum',
    enum: Object.values(AdminRole),
    default: AdminRole.MANAGER,
  })
  role: AdminRole

  @Column({
    type: 'enum',
    enum: Object.values(AccountStatus),
    default: AccountStatus.ENABLED,
  })
  status: AccountStatus

  @OneToOne(() => AdminProfileEntity, (profile) => profile.admin_user)
  @JoinTable()
  admin_profile?: AdminProfileEntity

  @OneToMany(() => PaymentWalletsEntity, (wallet) => wallet.admin)
  wallets: PaymentWalletsEntity[]

  @BeforeInsert()
  @BeforeUpdate()
  public hashPassword = hashMethod.bind(this)

  public comparePassword = compareMethod.bind(this)

  public toResponseObject = toResponseObject.bind(this)
}
