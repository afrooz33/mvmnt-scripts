import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (userId: string): Promise<SuccessRO> {
  try {
    const unblock = await this.updateOne({
      id: userId,
      blocked_details: null,
      account_status: AccountStatus.ENABLED,
    })

    await this.notificationsService.create({
      title: 'Your account block has been lifted',
      user: unblock.id,
      type: NotificationType.ACCOUNT_UNBLOCKED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.SERVICE,
    })

    return {
      message: `User [${unblock.id}] has been unblocked`,
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
