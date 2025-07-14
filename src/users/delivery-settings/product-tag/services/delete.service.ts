import { Not } from 'typeorm'
import { NotFoundException, PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    await this.checkPrecondition({}, userId)

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
        id,
        status: Not(DeliverySettingStatus.DELETED),
      },
      select: ['id'],
    })

    if (!exists) {
      throw new PreconditionFailedException(ErrorKey.PRODUCT_TAG_NAME_NOT_FOUND)
    }

    await this.updateOne({
      id,
      status: DeliverySettingStatus.DELETED,
    })

    return {
      success: true,
      message: 'Product tag deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
