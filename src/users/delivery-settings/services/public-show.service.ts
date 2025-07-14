import { ErrorKey, Query } from '@app/src/shared/enums'
import { GetAvailableDeliveryDates } from '@app/src/shared/helpers/Date.helper'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'

export default async function (type: string, userId: string): Promise<unknown> {
  try {
    const delivery_setting = await this.documentExists({
      condition: [
        {
          where: {
            user: {
              id: userId,
            },
            type,
            is_enabled: true,
          },
          relations: [Query.GENERAL_SETTINGS, Query.UNATTENDED_SETTINGS],
        },
      ],
      errorMessage: ErrorKey.DELIVERY_SETTINGS_NOT_FOUND,
    })

    if (type === DeliverySettingsType.GENERAL) {
      const general_setting = delivery_setting.general_settings.length
        ? delivery_setting.general_settings[0]
        : null

      if (!general_setting) {
        return {}
      }

      return {
        ...general_setting,
        available_delivery_dates: await GetAvailableDeliveryDates(general_setting),
      }
    }

    if (type === DeliverySettingsType.UNATTENDED) {
      return delivery_setting.unattended_settings || []
    }

    return
  } catch (error) {
    return HandleErrors(error)
  }
}
