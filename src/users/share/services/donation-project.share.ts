import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { StarActionType } from '@app/src/users/stars/enums'
import { SharedSnsPlatform } from '@app/src/users/share/enums'
import { ShareDonationProjectDto } from '@app/src/users/share/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectShareEntity } from '@app/src/users/share/donation-project/entities/donation-project-share.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (
  payload: ShareDonationProjectDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const donation_project: DonationProjectEntity = await this.donationProjectService.findOne({
      where: {
        id: payload.donation_project,
        status: In([
          DonationProjectStatus.ENDED,
          DonationProjectStatus.PUBLISHED,
          DonationProjectStatus.TO_BE_CANCELLED,
        ]),
      },
      relations: [Query.USER],
    })

    if (!donation_project) {
      throw new BadRequestException(ErrorKey.DONATION_PROJECT_NOT_FOUND)
    }

    const notification = {
      user_id: null,
      username: null,
      resource: donation_project.id,
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

      if (
        (payload.social_platform === SharedSnsPlatform.FACEBOOK ||
          payload.social_platform === SharedSnsPlatform.TWITTER) &&
        userId
      ) {
        this.eventEmitter.emit('user.award.contribution.stars', {
          userId,
          action: StarActionType.SHARE_DONATION_PROJECT,
          metadata: {
            donation_project: { id: donation_project.id },
          },
        })
      }
    }

    const share: DonationProjectShareEntity = await this.updateOne(payload)

    await this.notificationsService.create({
      title: 'Donation project has been shared',
      nonprofit: donation_project.user.id,
      type: NotificationType.DONATION_PROJECT_SHARED,
      receiver_type: NotificationReceiverType.NONPROFIT,
      related_to: NotificationRelatedTo.DONATION_PROJECT,
      data: notification,
    })

    if (userId) {
      this.eventEmitter.emit('user.award.contribution.stars', {
        userId,
        action: StarActionType.SHARE_DONATION_PROJECT,
        metadata: {
          donation_project: { id: donation_project.id },
        },
      })
    }

    return {
      success: true,
      message: 'Donation project successfully shared',
      data: share,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
