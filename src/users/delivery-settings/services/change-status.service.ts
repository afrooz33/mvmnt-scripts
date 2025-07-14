import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { ChangeDeliverySettingStatusDto } from '@app/src/users/delivery-settings/dto'

export default async function (
  payload: ChangeDeliverySettingStatusDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    await this.userService.documentExists({
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

    const delivery_settings = await this.documentExists({
      condition: [
        {
          where: {
            user: {
              id: userId,
            },
            type: payload.type,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.DELIVERY_SETTINGS_NOT_FOUND,
    })

    await this.updateOne({
      id: delivery_settings.id,
      is_enabled: payload.status,
    })

    return {
      success: true,
      message: 'Delivery setting status has been changed successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
