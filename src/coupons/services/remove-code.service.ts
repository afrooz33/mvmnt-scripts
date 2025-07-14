import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

export default async function (cartId: string, userId: string): Promise<SuccessRO> {
  try {
    const cart = await this.buynowService.documentExists({
      condition: [
        {
          where: {
            id: cartId,
            user: {
              id: userId,
            },
            status: CartStatus.PENDING,
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.INVALID_CART,
        args: { id: cartId },
      }),
    })

    cart.coupon = null

    await cart.save()

    return {
      success: true,
      message: 'Coupon removed successfully',
      data: cart,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
