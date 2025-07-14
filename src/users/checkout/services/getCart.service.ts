import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { getCart, getCartItem, getUser } from './methods'

export default async function (cartId: string, userId: string): Promise<unknown> {
  try {
    let user = await getUser.bind(this)(userId)

    const cart = await getCart.bind(this)(cartId, userId, false)
    const items = await getCartItem.bind(this)(cart, userId)

    if (cart.is_anonymous) {
      user = {
        id: user.id,
      }
    }

    // Add reservation logic here
    if (cart?.delivery_address?.id && items) {
      for (const deliveryGroup in items) {
        for (const item of items[deliveryGroup]) {
          if (!item.out_of_stock && !item.shipping_origins) {
            try {
              await this.inventoryService.reserveInventory(
                { id: item.id, variant: { id: item.variant.id } },
                item.variant.seller_id,
                cart.delivery_address.id,
              )

              const origins = await this.inventoryService.getShippingOriginsForCartItem(item.id)

              if (origins && origins.length > 0) {
                item.shipping_origins = origins
              }
            } catch (error) {
              console.error('Error reserving inventory during checkout:', error)
            }
          }
        }
      }
    }

    return {
      user,
      cart,
      items,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
