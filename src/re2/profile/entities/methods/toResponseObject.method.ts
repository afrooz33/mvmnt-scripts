import { ProfileRO } from '@app/src/re2/profile/dto'

export default function (): ProfileRO {
  const responseObject: any = {
    id: this.id,
    first_name: this.first_name,
    last_name: this.last_name,
    notification_email: this.notification_email,
    company_name: this.company_name,
    phone: this.phone,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  return responseObject
}
