import {
  Unique,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
} from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AccountType } from '@app/src/shared/auth/enums'
import { hashMethod, compareMethod } from '@app/src/shared/entities/methods'
import { AccountStatus } from '@app/src/re2/user/enums'
import { toResponseObject } from '@app/src/re2/user/entities/methods'
import { ProfileEntity } from '@app/src/re2/profile/entities/profile.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { IntegrationsEntity } from '@app/src/re2/integrations/entities/integrations.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'

@Entity('re2_users')
export class Re2UserEntity extends MyEntity {
  @Column({
    type: 'text',
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  @Unique(['email'])
  email: string

  @Column({
    type: 'text',
    default: '',
  })
  password: string

  @Column({
    type: 'text',
    default: '',
  })
  reset_password_token: string

  @Column({
    type: 'enum',
    enum: Object.values(AccountType),
    default: AccountType.RE2,
  })
  account_type: AccountType

  @Column({
    type: 'enum',
    enum: Object.values(AccountStatus),
    default: AccountStatus.ACTIVE,
  })
  account_status: AccountStatus

  @OneToOne(() => ProfileEntity, (profile) => profile.user)
  @JoinTable()
  profile?: ProfileEntity

  @OneToMany(() => FundraiserEntity, (fundraiser) => fundraiser.user)
  @JoinTable()
  fundraisers?: FundraiserEntity[]

  @OneToMany(() => IntegrationsEntity, (integration) => integration.user)
  @JoinTable()
  integrations?: IntegrationsEntity[]

  @OneToMany(() => PaymentWalletsEntity, (wallet) => wallet.re2)
  wallets: PaymentWalletsEntity[]

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  last_login?: Date

  @Column('text', { nullable: true })
  admin_memo?: string

  @BeforeInsert()
  @BeforeUpdate()
  public hashPassword = hashMethod.bind(this)

  public comparePassword = compareMethod.bind(this)

  public toResponseObject = toResponseObject.bind(this)
}
