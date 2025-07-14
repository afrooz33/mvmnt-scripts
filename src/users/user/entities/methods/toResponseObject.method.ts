import { JwtDto } from '@app/src/shared/auth/dto'
import { UserRO } from '@app/src/users/auth/dto'

export default function (jwt: JwtDto): UserRO {
  const responseObject: UserRO = {
    id: this.id,
    email: this.email,
    account_type: this.account_type,
    two_factor_enabled: this.two_factor_authentication?.enabled,
    follower_count: this.follower_count,
    following_count: this.following_count,
    account_status: this.account_status,
    display_name: this.display_name,
    brand_url: this.brand_url,
    username: this.username,
    gender: this.gender,
    total_donations: this.total_donations,
    gross_donations: this.gross_donations,
    updated: this.updated,
    created: this.created,
    jwt,
    referral_code: this.referral_code,
    total_buy: this.total_buy,
    total_sell: this.total_sell,
    last_login: this.last_login,
    blocked_details: this.blocked_details,
    is_verified: this.is_verified,
    rank: this.rank,
    grade: this.grade,
  }

  if (this.profile) {
    responseObject.profile = this.profile.toResponseObject()
  }

  if (this.identity_documents) {
    responseObject.identity_documents = this.identity_documents
  }

  if (this.nonprofit) {
    responseObject.nonprofit = this.nonprofit.id
  }

  return responseObject
}
