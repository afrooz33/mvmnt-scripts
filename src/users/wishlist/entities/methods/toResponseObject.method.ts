interface WishlistVariantResponse {
  id: string
  sorting_order: number
  comment: string
  priority: string
  needs: number
  variant?: any
  has: number
}

export default function (): WishlistVariantResponse {
  const responseObject: WishlistVariantResponse = {
    id: this.id,
    sorting_order: Number(this.sorting_order),
    comment: this.comment,
    priority: this.priority,
    needs: Number(this.needs),
    has: this.has,
  }

  if (this.variant) {
    responseObject.variant = {
      id: this.variant.id,
      price: this.variant.price,
      option_values: this.variant.option_values,
      images: this.variant.images,
    }

    if (this.variant.deal) {
      responseObject.variant['deal'] = {
        id: this.variant.deal.id,
        name: this.variant.deal.name,
        deal_type: this.variant.deal.deal_type,
      }
    }
  }

  return responseObject
}
