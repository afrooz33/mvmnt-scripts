import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'

export default function (): BuynowCartEntity {
  const responseObject: any = {
    id: this.id,
    status: this.status,
    updated: this.updated,
    created: this.created,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.seller) {
    responseObject.seller = {
      id: this.seller.id,
      username: this.seller.username,
      display_name: this.seller.display_name,
      profile: this.seller.profile,
    }
  }

  if (this.items) {
    responseObject.items = this.items

    responseObject.items.forEach((item: any) => {
      if (item.deal) {
        item.deal = {
          id: item.deal.id,
          name: item.deal.name,
          deal_type: item.deal.deal_type,
        }
      }

      if (item.variant) {
        item.variant = item.variant.toResponseObject()
      }
    })
  }

  if (this.wishlist) {
    responseObject.wishlist = this.wishlist

    if (this.wishlist.user) {
      responseObject.wishlist.user = this.wishlist.user.toResponseObject()
    }
  }

  return responseObject
}
