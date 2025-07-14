import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { NotificationSettingEntity } from '@app/src/notifications/entities/settings.entity'

export default async function (userId: string): Promise<NotificationSettingEntity[]> {
  try {
    return await this.notificationSettingRepository.find({
      where: { user: { id: userId } },
      select: ['type', 'status'],
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
