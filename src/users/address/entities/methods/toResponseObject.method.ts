import { UserAddressRO } from '@app/src/users/address/dto'

export default function (): UserAddressRO {
  const responseObject: Partial<UserAddressRO> = {
    id: this.id,
    street: this.street,
    city: this.city,
    state: this.state,
    postcode: this.postcode,
    phone_number: this.phone_number,
    building: this.building,
    is_default: this.is_default,
    name: this.name,
    country: this.country,
    type: this.type,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  return responseObject as UserAddressRO
}
