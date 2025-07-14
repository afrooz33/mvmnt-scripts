import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { NotificationType } from '@app/src/notifications/enums'

export default async function (cartId: string, userId: string): Promise<SuccessRO> {
  try {
    const user: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: userId },
      }),
    })

    const cart: BuynowCartEntity = await this.documentExists({
      condition: [
        {
          where: {
            id: cartId,
            status: CartStatus.WAITING_SHIPMENT,
            seller: {
              id: user.id,
            },
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RESOURCE_NOT_FOUND,
        args: { id: cartId },
      }),
    })

    cart.status = CartStatus.SHIPPED
    await cart.save()

    await this.notificationsService.create({
      title: 'Your order has been shipped',
      user: cart.user,
      type: NotificationType.BUYNOW_ORDER_SHIPPED,
      data: {
        id: cart.id,
      },
    })

    return {
      success: true,
      message: 'Order marked as shipped successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
