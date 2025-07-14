import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateCartDeliveryDto } from '@app/src/users/checkout/dto'
import { getCart, getUser } from './methods'

export default async function (payload: UpdateCartDeliveryDto, userId: string): Promise<SuccessRO> {
  try {
    await getUser.bind(this)(userId)

    const cart = await getCart.bind(this)(payload.cart, userId, true)

    const items = await this.buynowCartItemRepository.find({
      where: {
        cart: { id: cart.id },
        delivery_date: payload.old_delivery_date,
      },
      relations: [Query.VARIANT],
    })

    if (!items.length || items.length !== payload.variants.length) {
      throw new BadRequestException(ErrorKey.INVALID_VARIANT)
    }

    for (const variant of payload.variants) {
      const isValid = items.find((item) => item.variant.id === variant)

      if (!isValid) {
        throw new BadRequestException(ErrorKey.INVALID_VARIANT)
      }
    }

    for (const item of items) {
      const deliverySettings = await this.deliverySettingService.calculateDeliveryDate({
        variant: item.variant.id,
      })

      if (!deliverySettings.delivery_dates.length) {
        throw new BadRequestException(ErrorKey.DELIVERY_SETTINGS_NOT_FOUND)
      }

      if (!deliverySettings.delivery_dates.includes(payload.delivery_date)) {
        throw new BadRequestException(ErrorKey.INVALID_DELIVERY_DATE)
      }

      if (
        deliverySettings?.delivery_carrier?.time_slot &&
        !deliverySettings?.delivery_carrier?.time_slot?.includes(payload.delivery_time_slot)
      ) {
        throw new BadRequestException(ErrorKey.INVALID_DELIVERY_TIME_SLOT)
      }

      item.delivery_date = payload.delivery_date
      item.delivery_time_slot = payload.delivery_time_slot
    }

    await this.buynowCartItemRepository.save(items)

    return {
      success: true,
      message: 'Cart updated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
