import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { CreateProductTagDto } from '@app/src/users/delivery-settings/product-tag/dto'

export default async function (payload: CreateProductTagDto, userId: string): Promise<SuccessRO> {
  try {
    await this.checkPrecondition(payload, userId)

    let delivery_settings = await this.deliverySettingsRepository.findOne({
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
      delivery_settings = await this.deliverySettingsRepository.save({
        type: DeliverySettingsType.PRODUCT_TAG,
        user: {
          id: userId,
        },
        is_enabled: true,
      })
    }

    const exists = await this.productTagSettingsRepository.findOne({
      where: {
        delivery_settings: {
          id: delivery_settings.id,
        },
        status: Not(DeliverySettingStatus.DELETED),
        name: payload.name,
      },
      select: ['id'],
    })

    if (exists) {
      throw new PreconditionFailedException(ErrorKey.PRODUCT_TAG_NAME_ALREADY_EXISTS)
    }

    await this.updateOne({
      ...payload,
      delivery_settings,
    })

    return {
      success: true,
      message: 'Product tag created successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
