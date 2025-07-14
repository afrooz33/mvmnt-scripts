import { ProfileRO } from '@app/src/nonprofit/profile/dto'

export default function (): ProfileRO {
  const responseObject: any = {
    id: this.id,
    first_name: this.first_name,
    last_name: this.last_name,
    notification_email: this.notification_email,
    profile_picture: this.profile_picture,
    foundation_name: this.foundation_name,
    foundation_url: this.foundation_url,
    introduction: this.introduction,
    corporate_number: this.corporate_number,
    phone: this.phone,
    social_accounts: this.social_accounts,
    donation_presets: this.donation_presets,
    default_donation_preset_amount: this.default_donation_preset_amount,
    updated: this.updated,
    status: this.status,
    profile_image: this.profile_image,
    language: this.language,
    tags: this.tags,
    timezone: this.timezone,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  return responseObject
}
