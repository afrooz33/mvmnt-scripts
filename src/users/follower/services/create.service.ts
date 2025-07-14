import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { FollowerDto } from '@app/src/users/follower/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import {
  NotificationReceiverType,
  NotificationRelatedTo,
  NotificationType,
} from '@app/src/notifications/enums'

export default async function createService(payload: FollowerDto): Promise<SuccessRO> {
  try {
    const follower: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: payload.follower,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'username'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: payload.follower },
      }),
    })

    const following: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: payload.following,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'username'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: payload.following },
      }),
    })

    const result = await this.updateOne({
      follower: follower.id,
      following: following.id,
    })

    await this.notificationsService.create({
      title: `Followed by ${follower.username}`,
      user: following.id,
      type: NotificationType.FOLLOWED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.USER,
      data: {
        follower: follower.id,
        username: follower.username,
      },
    })

    return {
      message: 'User followed successfully',
      data: result,
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
