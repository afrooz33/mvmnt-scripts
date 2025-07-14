import { In, Not } from 'typeorm'
import { Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { LikeDealDto } from '@app/src/users/deal/like/dto'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (payload: LikeDealDto, userId: string): Promise<SuccessRO> {
  try {
    const deal: DealEntity = await this.dealService.findOne({
      where: {
        id: payload.deal,
        user: {
          id: Not(userId),
        },
        status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
      },
      relations: [Query.USER],
      select: ['id', 'name', 'user'],
    })

    await this.likeRepository.upsert(
      {
        ...payload,
        user: {
          id: userId,
        },
        updated: new Date(),
      },
      {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: this.uniqueKey,
      },
    )

    await this.notificationsService.create({
      title: "You've received a like on your Deal",
      user: deal.user,
      type: NotificationType.DEAL_LIKED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: deal.id,
        deal_name: deal.name,
      },
    })

    return {
      success: true,
      message: 'Deal liked successfully',
      data: payload,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
