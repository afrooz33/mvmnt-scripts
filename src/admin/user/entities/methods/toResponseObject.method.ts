import { AdminUserRO } from '@app/src/admin/auth/dto'
import { JwtDto } from '@app/src/shared/auth/dto'

export default function (jwt: JwtDto): AdminUserRO {
  const responseObject: AdminUserRO = {
    id: this.id,
    email: this.email,
    role: this.role,
    admin_profile: this.admin_profile,
    status: this.status,
    updated: this.updated,
    created: this.created,
    wallet_address: this.wallet_address,
    smart_account: this.smart_account,
    jwt,
  }

  return responseObject
}
