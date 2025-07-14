import { SharedDealRO } from '@app/src/users/share/dto'

export default function (): SharedDealRO {
  const responseObject: any = {
    id: this.id,
    updated: this.updated,
    created: this.created,
    user: null,
    deal: null,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.deal) {
    responseObject.deal = this.deal.toResponseObject()
  }

  if (this.donation_project) {
    responseObject.donation_project = this.donation_project.toResponseObject()
  }

  if (this.nonprofit) {
    responseObject.nonprofit = this.nonprofit.toResponseObject()
  }

  return responseObject
}
