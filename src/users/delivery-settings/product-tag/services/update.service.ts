import { Not } from 'typeorm'
import { NotFoundException, PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { UpdateProductTagDto } from '@app/src/users/delivery-settings/product-tag/dto'

export default async function (payload: UpdateProductTagDto, userId: string): Promise<SuccessRO> {
  try {
    await this.checkPrecondition(payload, userId)

    const delivery_settings = await this.deliverySettingsRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        type: DeliverySettingsType.PRODUCT_TAG,
        is_enabled: true,
      },
      select: ['id'],
    })

    if (!delivery_settings) {
      throw new NotFoundException(ErrorKey.DELIVERY_SETTINGS_NOT_FOUND)
    }

    const exists = await this.productTagSettingsRepository.findOne({
      where: {
        delivery_settings: {
          id: delivery_settings.id,
        },
        id: payload.id,
      },
      select: ['id'],
    })

    if (!exists) {
      throw new PreconditionFailedException(ErrorKey.PRODUCT_TAG_NAME_NOT_FOUND)
    }

    const duplicate = await this.productTagSettingsRepository.findOne({
      where: {
        delivery_settings: {
          id: delivery_settings.id,
        },
        name: payload.name,
        id: Not(payload.id),
      },
      select: ['id'],
    })

    if (duplicate) {
      throw new PreconditionFailedException(ErrorKey.PRODUCT_TAG_NAME_ALREADY_EXISTS)
    }

    await this.productTagSettingsRepository.save({
      id: payload.id,
      ...payload,
      days_range: payload.days_range ?? null,
      date_range: payload.date_range ?? null,
      delivery_settings,
    })

    return {
      success: true,
      message: 'Product tag updated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
