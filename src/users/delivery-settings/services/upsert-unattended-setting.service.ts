import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { CreateUnattendedSettingDto } from '@app/src/users/delivery-settings/dto'

export default async function (
  payload: CreateUnattendedSettingDto,
  userId: string,
  skip: boolean = false,
): Promise<SuccessRO> {
  try {
    if (!skip) {
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
    }

    let delivery_settings = await this.findOne({
      where: {
        user: {
          id: userId,
        },
        type: DeliverySettingsType.UNATTENDED,
        is_enabled: true,
      },
      select: ['id'],
    })

    if (!delivery_settings) {
      delivery_settings = await this.updateOne({
        type: DeliverySettingsType.UNATTENDED,
        user: {
          id: userId,
        },
      })
    }

    await this.unattendedSettingRepository.delete({
      delivery_settings: {
        id: delivery_settings?.id,
      },
    })

    await Promise.all(
      payload.locations.map(async (location) => {
        await this.unattendedSettingRepository.save({
          location,
          delivery_settings: {
            id: delivery_settings?.id,
          },
        })
      }),
    )

    return {
      success: true,
      message: 'Unattended settings successfully created',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
