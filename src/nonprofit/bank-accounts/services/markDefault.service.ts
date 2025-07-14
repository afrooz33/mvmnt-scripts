import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { BankAccountEntity } from '@app/src/nonprofit/bank-accounts/entities/bank-account.entity'

export default async function (id: string, user: string): Promise<SuccessRO> {
  const bankAccount: BankAccountEntity = await this.documentExists({
    condition: [
      {
        where: {
          id,
          user: {
            id: user,
          },
          bank_account_status: Not(Status.DELETED),
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.BANK_ACCOUNT_NOT_FOUND,
      args: { id },
    }),
  })

  await this.bankAccountRepository.update(
    {
      user: {
        id: user,
      },
      bank_account_status: Not(Status.DELETED),
      is_default: true,
    },
    {
      is_default: false,
    },
  )

  await this.updateOne({
    ...bankAccount,
    is_default: true,
  })

  return {
    message: 'Bank account marked as default successfully',
    success: true,
  }
}
