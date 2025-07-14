import { ConflictException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { CreateBankAccountDto } from '@app/src/nonprofit/bank-accounts/dto'
import { BankAccountEntity } from '@app/src/nonprofit/bank-accounts/entities/bank-account.entity'
import { BankAccountStatus } from '@app/src/nonprofit/bank-accounts/enums'
import { Not } from 'typeorm'

export default async function (payload: CreateBankAccountDto, userId: string): Promise<SuccessRO> {
  const exists: BankAccountEntity = await this.findOne({
    where: {
      user: {
        id: userId,
      },
      account_number: payload.account_number,
      bank_account_status: Not(BankAccountStatus.DELETED),
    },
  })

  if (exists) {
    throw new ConflictException(`Your bank account [${payload.account_number}] already exist`)
  }

  const account: BankAccountEntity = await this.updateOne({
    ...payload,
    user: {
      id: userId,
    },
  })

  return {
    success: true,
    message: `Bank account [${account.id}] successfully saved`,
    data: account,
  }
}
