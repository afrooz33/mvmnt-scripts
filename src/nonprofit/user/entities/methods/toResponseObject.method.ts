import { NonprofitUserRO } from '@app/src/nonprofit/auth/dto'
import { JwtDto } from '@app/src/shared/auth/dto'

export default function (jwt: JwtDto): NonprofitUserRO {
  const responseObject: any = {
    id: this.id,
    email: this.email,
    account_type: this.account_type,
    account_status: this.account_status,
    total_donations: this.total_donations,
    total_donors: this.total_donors,
    wallet_address: this.wallet_address,
    smart_account: this.smart_account,
    created: this.created,
    updated: this.updated,
  }

  if (jwt) {
    responseObject.jwt = jwt
  }

  if (this.profile) {
    responseObject.profile = this.profile.toResponseObject()
  }

  if (this.bank_accounts) {
    responseObject.bank_accounts = this.bank_accounts.map((bankAccount) =>
      bankAccount.toResponseObject(),
    )
  }

  return responseObject
}
