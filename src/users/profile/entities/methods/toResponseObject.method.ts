import { ProfileRO } from '@app/src/users/profile/dto/ProfileRO'

export default function (): ProfileRO {
  const responseObject: any = {
    id: this.id,
    introduction: this.introduction,
    social_accounts: this.social_accounts,
    created: this.created,
    updated: this.updated,
    profile_images: this.profile_images,
    verification_status: this.verification_status,
    name: this.name,
    birthday: this.birthday,
    addresses: this.addresses,
    identity_verification_status: this.identity_verification_status,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.language) {
    responseObject.language = this.language.toResponseObject()
  }

  return responseObject
}
