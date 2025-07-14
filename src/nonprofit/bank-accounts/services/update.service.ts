import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { UpdateBankAccountDto } from '@app/src/nonprofit/bank-accounts/dto'
import { BankAccountEntity } from '@app/src/nonprofit/bank-accounts/entities/bank-account.entity'

export default async function (
  payload: UpdateBankAccountDto,
  userId: string,
  id: string,
): Promise<SuccessRO> {
  if (id !== payload.id) {
    throw new Error(`Bank account id [${id}] does not match payload id [${payload.id}]`)
  }

  const bankAccount: BankAccountEntity = await this.updateOne(
    {
      ...payload,
      user: userId,
    },
    {
      where: {
        id: payload.id,
        user: In([userId]),
        bank_account_status: Not(Status.DELETED),
      },
      errorKey: ErrorKey.BANK_ACCOUNT_NOT_FOUND,
    },
  )

  return {
    success: true,
    message: `Bank account [${bankAccount.id}] successfully saved`,
    data: bankAccount,
  }
}
