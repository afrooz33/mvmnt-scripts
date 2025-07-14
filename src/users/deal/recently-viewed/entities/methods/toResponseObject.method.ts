import { LikedDealRO } from '@app/src/users/deal/like/dto'

export default function (): LikedDealRO {
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

  return responseObject
}
