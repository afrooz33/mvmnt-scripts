import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { BankAccountStatus, BankAccountType } from '@app/src/nonprofit/bank-accounts/enums'

export default async function (total = 100) {
  const nonprofituser: ISeederEntity[] = await this.getNonprofits()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const user = faker.helpers.arrayElement(nonprofituser).id

          const userBankAccount = await this.entityManager.query(
            `SELECT COUNT(*) FROM "bank_accounts" WHERE "userId" = '${user}';`,
          )

          await this.entityManager.save('bank_accounts', {
            user,
            bank_name: faker.finance.accountName(),
            bank_account_type: faker.helpers.enumValue(BankAccountType),
            branch_code: faker.finance.bic(),
            account_number: faker.finance.accountNumber(),
            account_holder_name: faker.person.fullName(),
            is_default: parseInt(userBankAccount[0].count) > 0 ? false : true,
            bank_account_status: faker.helpers.arrayElement([
              BankAccountStatus.ACTIVE,
              BankAccountStatus.INACTIVE,
            ]),
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
