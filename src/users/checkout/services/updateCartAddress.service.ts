import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { UpdateCartAddressDto } from '@app/src/users/checkout/dto'
import { getCart, getUser } from './methods'

export default async function (payload: UpdateCartAddressDto, userId: string): Promise<SuccessRO> {
  try {
    await getUser.bind(this)(userId)

    const cart = await getCart.bind(this)(payload.cart, userId, true)

    const delivery_address = await this.addressService.documentExists({
      condition: [
        {
          where: {
            id: payload.delivery_address,
            status: UserAddressStatus.ENABLED,
            is_personal: false,
            profile: {
              user: { id: userId },
            },
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.ADDRESS_NOT_FOUND,
    })

    await this.buynowCartRepository.save({
      ...cart,
      delivery_address: {
        id: delivery_address.id,
      },
    })

    return {
      message: 'Cart address updated successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
