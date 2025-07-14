import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { CreateDeliverySettingDto } from '@app/src/users/delivery-settings/dto'

export default async function (
  payload: CreateDeliverySettingDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    let delivery_settings = await this.findOne({
      where: {
        user: {
          id: userId,
        },
        type: DeliverySettingsType.GENERAL,
        is_enabled: true,
      },
      select: ['id'],
    })

    if (!delivery_settings) {
      delivery_settings = await this.updateOne({
        type: DeliverySettingsType.GENERAL,
        user: {
          id: userId,
        },
      })
    }

    const general_setting = await this.generalDeliverySettingsRepository.findOne({
      where: {
        delivery_settings: {
          id: delivery_settings?.id,
        },
      },
      select: ['id'],
    })

    const carrier = await this.deliveryCarrierService.documentExists({
      condition: [
        {
          where: {
            id: payload.carrier,
            user: {
              id: user.id,
            },
            status: Not(DeliverySettingStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.DELIVERY_CARRIER_NOT_FOUND,
    })

    await this.generalDeliverySettingsRepository.save({
      id: general_setting?.id,
      ...payload,
      user: user.id,
      carrier: carrier.id,
      delivery_settings,
    })

    return {
      success: true,
      message: 'Delivery settings successfully created',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
