import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import {
  NotificationStatus,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function unreadCountService(userId: string): Promise<any> {
  try {
    const condition = {
      user: {
        id: userId,
      },
      status: NotificationStatus.UNREAD,
      receiver_type: NotificationReceiverType.USER,
    }

    const unreadCounts = {}

    // Iterate over each enum value of NotificationRelatedTo
    // this will give us the enum value and the enum key (relatedToValue)
    // for example, relatedToValue = 'DEAL' and relatedToEnum = NotificationRelatedTo.DEAL
    // in future, if we add more values to NotificationRelatedTo, this code will still work
    for (const relatedToValue in NotificationRelatedTo) {
      if (isNaN(Number(relatedToValue))) {
        const relatedToEnum = NotificationRelatedTo[relatedToValue]

        unreadCounts[relatedToValue.toLowerCase()] = await this.notificationRepository.count({
          where: {
            ...condition,
            related_to: relatedToEnum,
          },
        })
      }
    }

    return unreadCounts
  } catch (error) {
    return HandleErrors(error)
  }
}
