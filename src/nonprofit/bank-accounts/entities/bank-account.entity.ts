import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BankAccountType } from '@app/src/nonprofit/bank-accounts/enums'
import { BankAccountStatus } from '@app/src/nonprofit/bank-accounts/enums/bank-account-status.enum'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

@Entity('bank_accounts')
export class BankAccountEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  bank_name: string

  @Column({
    type: 'enum',
    enum: Object.values(BankAccountType),
    default: BankAccountType.SAVING,
    nullable: false,
  })
  bank_account_type: BankAccountType

  @Column({
    type: 'text',
    nullable: false,
  })
  branch_code: string

  @Column({
    type: 'text',
    nullable: false,
  })
  account_number: string

  @Column({
    type: 'text',
    nullable: false,
  })
  account_holder_name: string

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  is_default: boolean

  @Column({
    type: 'enum',
    enum: Object.values(BankAccountStatus),
    default: BankAccountStatus.ACTIVE,
    nullable: false,
  })
  bank_account_status: BankAccountStatus

  @ManyToOne(() => NonprofitUserEntity, (user) => user.bank_accounts)
  user: NonprofitUserEntity
}
