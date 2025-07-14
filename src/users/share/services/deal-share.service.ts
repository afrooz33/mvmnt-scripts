import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { ShareDealDto } from '@app/src/users/share/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DealStatus } from '@app/src/users/deal/enums'
import { StarActionType } from '@app/src/users/stars/enums'
import { SharedSnsPlatform } from '@app/src/users/share/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealShareEntity } from '@app/src/users/share/deal/entities/deal-share.entity'

export default async function (payload: ShareDealDto): Promise<SuccessRO> {
  try {
    const deal: DealEntity = await this.dealService.findOne({
      where: {
        id: payload.deal,
        status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
      },
      relations: [Query.USER],
    })

    if (!deal) {
      throw new BadRequestException(
        JSON.stringify({
          key: ErrorKey.DEAL_NOT_FOUND,
          args: { id: payload.deal },
        }),
      )
    }

    const notification = {
      resource: deal.id,
      user_id: null,
      username: null,
      shared_on: payload.social_platform,
    }

    if (payload.user) {
      const user: UserEntity = await this.userService.documentExists({
        condition: [
          {
            where: {
              id: payload.user,
              account_status: AccountStatus.ENABLED,
            },
          },
        ],
        errorMessage: JSON.stringify({
          key: ErrorKey.USER_NOT_FOUND,
          args: { id: payload.user },
        }),
      })

      notification.user_id = user.id
      notification.username = user.username

      // If the user is sharing the deal on Facebook or Twitter, then we will give them 10 stars
      if (
        (payload.social_platform === SharedSnsPlatform.FACEBOOK ||
          payload.social_platform === SharedSnsPlatform.TWITTER) &&
        payload.user
      ) {
        this.eventEmitter.emit('user.award.contribution.stars', {
          userId: payload.user,
          action: StarActionType.SHARE_DEAL,
          metadata: {
            deal: { id: deal.id },
          },
        })
      }
    }

    const share: DealShareEntity = await this.updateOne(payload)

    await this.notificationsService.create({
      title: 'Your Deal has been shared',
      user: deal.user.id,
      type: NotificationType.DEAL_SHARED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: notification,
    })

    return {
      success: true,
      message: 'Deal successfully shared',
      data: share,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
