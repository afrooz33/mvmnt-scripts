import { Request } from 'express'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import decodeCookie from '@app/src/shared/services/decodeCookie.service'

export default async function (user: string, req: Request): Promise<number> {
  try {
    const xGuestCartId: string = await decodeCookie(req, 'xGuestCartId')

    if (!user && !xGuestCartId) {
      return 0
    }

    const query = `SELECT
        SUM("item"."quantity") as "total"
      FROM
        "user_deal_buynow_cart" "cart"
      INNER JOIN "user_deal_buynow_cart_items" "item" ON "cart"."id" = "item"."cartId"
      WHERE "cart"."status" = '${CartStatus.PENDING}'
      ${user ? `AND "cart"."userId" = '${user}'` : ''} ${
        xGuestCartId && !user ? `AND "cart"."guestCartId" = '${xGuestCartId}'` : ''
      }`

    const result = await this.buyNowCartRepository.query(query)

    return result[0].total || 0
  } catch (error) {
    return HandleErrors(error)
  }
}
