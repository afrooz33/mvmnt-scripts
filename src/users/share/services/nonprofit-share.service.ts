import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { StarActionType } from '@app/src/users/stars/enums'
import { ShareNonprofitDto } from '@app/src/users/share/dto'
import { SharedSnsPlatform } from '@app/src/users/share/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { AccountStatus as NonprofitAccountStatus } from '@app/src/nonprofit/user/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { NonprofitShareEntity } from '@app/src/users/share/nonprofit/entities/nonprofit-share.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (payload: ShareNonprofitDto, userId: string): Promise<SuccessRO> {
  try {
    const nonprofit_user: NonprofitUserEntity = await this.nonprofitUserService.findOne({
      where: {
        id: payload.nonprofit,
        account_status: NonprofitAccountStatus.ACTIVE,
      },
    })

    if (!nonprofit_user) {
      throw new BadRequestException(ErrorKey.NONPROFIT_PROFILE_NOT_FOUND)
    }

    const notification = {
      user_id: null,
      username: null,
      resource: nonprofit_user.id,
      shared_on: payload.social_platform,
    }

    if (userId) {
      const user: UserEntity = await this.userService.documentExists({
        condition: [
          {
            where: {
              id: userId,
              account_status: AccountStatus.ENABLED,
            },
            select: ['id', 'username'],
          },
        ],
        errorMessage: ErrorKey.USER_NOT_FOUND,
      })

      notification.user_id = user.id
      notification.username = user.username

      // If the user is sharing the nonprofit on Facebook or Twitter, then we will give them 10 stars
      if (
        payload.social_platform === SharedSnsPlatform.FACEBOOK ||
        payload.social_platform === SharedSnsPlatform.TWITTER
      ) {
        if (userId) {
          this.eventEmitter.emit('user.award.contribution.stars', {
            userId,
            action: StarActionType.SHARE_NONPROFIT,
            metadata: {
              nonprofit: { id: nonprofit_user.id },
            },
          })
        }
      }
    }

    const share: NonprofitShareEntity = await this.updateOne(payload)

    await this.notificationsService.create({
      title: 'Nonprofit page has been shared',
      nonprofit: nonprofit_user.id,
      type: NotificationType.NONPROFIT_SHARED,
      receiver_type: NotificationReceiverType.NONPROFIT,
      related_to: NotificationRelatedTo.NONPROFIT,
      data: notification,
    })

    if (userId) {
      this.eventEmitter.emit('user.award.contribution.stars', {
        userId,
        action: StarActionType.SHARE_NONPROFIT,
        metadata: {
          nonprofit: { id: nonprofit_user.id },
        },
      })
    }

    return {
      success: true,
      message: 'Nonprofit successfully shared',
      data: share,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
