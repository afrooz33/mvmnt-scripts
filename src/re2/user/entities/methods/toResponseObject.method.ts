import { JwtDto } from '@app/src/shared/auth/dto'
import { NonprofitUserRO } from '@app/src/nonprofit/auth/dto'

export default function (jwt: JwtDto): NonprofitUserRO {
  const responseObject: any = {
    id: this.id,
    email: this.email,
    account_type: this.account_type,
    account_status: this.account_status,
    created: this.created,
    updated: this.updated,
    wallet_address: this.wallet_address,
    smart_account: this.smart_account,
  }

  if (jwt) {
    responseObject.jwt = jwt
  }

  if (this.profile) {
    responseObject.profile = this.profile
  }

  return responseObject
}
