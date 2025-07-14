import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpsertNotificationSettingsDto } from '@app/src/notifications/dto'

export default async function (
  payload: UpsertNotificationSettingsDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const setting = await this.notificationSettingRepository.findOne({
      where: { user: { id: userId }, type: payload.type },
    })

    if (!setting) {
      await this.notificationSettingRepository.save({
        user: { id: userId },
        ...payload,
      })
    } else {
      setting.status = payload.status

      await this.notificationSettingRepository.save(setting)
    }

    return {
      message: 'Notification setting updated successfully',
      success: true,
      data: setting ?? {},
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
