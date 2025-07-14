import {
  Unique,
  Column,
  Entity,
  OneToOne,
  JoinTable,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  VirtualColumn,
} from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AccountType } from '@app/src/shared/auth/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { NewsEntity } from '@app/src/nonprofit/news/entities/news.entity'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { BankAccountEntity } from '@app/src/nonprofit/bank-accounts/entities/bank-account.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { Blocked } from './properties'
import { compareMethod, hashMethod, toResponseObject } from './methods'

@Entity('nonprofit_users')
export class NonprofitUserEntity extends MyEntity {
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
    default: AccountType.NONPROFIT,
  })
  account_type: AccountType

  @Column({
    type: 'enum',
    enum: Object.values(AccountStatus),
    default: AccountStatus.ACTIVE,
  })
  account_status: AccountStatus

  @OneToOne(() => NonprofitProfileEntity, (profile) => profile.user)
  @JoinTable()
  profile?: NonprofitProfileEntity

  @OneToMany(() => DonationProjectEntity, (donation_project) => donation_project.user)
  donation_projects?: DonationProjectEntity[]

  @OneToMany(() => NewsEntity, (news) => news.user)
  news?: NewsEntity[]

  @OneToMany(() => BankAccountEntity, (bankAccounts) => bankAccounts.user)
  bank_accounts?: BankAccountEntity

  @OneToMany(() => DealEntity, (deal) => deal.donation_nonprofit)
  deals?: DealEntity[]

  @Column('jsonb', { default: null, nullable: true })
  blocked_details?: Blocked

  @OneToMany(() => PaymentWalletsEntity, (wallet) => wallet.nonprofit)
  wallets: PaymentWalletsEntity[]

  @VirtualColumn({
    query: (alias) =>
      `(
      SELECT COALESCE(SUM("donation"."amount"), 0)
        FROM "user_donations" AS "donation"
        WHERE
          "donationProjectId" IN (SELECT "id" FROM "donation_projects" WHERE "userId" = ${alias}."id")
          AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}'))`,
  })
  total_donations?: number

  @VirtualColumn({
    query: (alias) =>
      `(
      SELECT COUNT(DISTINCT "donation"."userId")
        FROM "user_donations" AS "donation"
        WHERE
          "donationProjectId" IN (SELECT "id" FROM "donation_projects" WHERE "userId" = ${alias}."id")
          AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}'))`,
  })
  total_donors?: number

  @BeforeInsert()
  @BeforeUpdate()
  public hashPassword = hashMethod.bind(this)

  public comparePassword = compareMethod.bind(this)

  public toResponseObject = toResponseObject.bind(this)
}
