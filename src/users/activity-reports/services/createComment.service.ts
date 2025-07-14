import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { CreateCommentDto } from '@app/src/users/activity-reports/dto'
import { ActivityReportStatus } from '@app/src/users/activity-reports/enums'
import { BadRequestException } from '@nestjs/common'

export default async function (payload: CreateCommentDto, userId: string): Promise<SuccessRO> {
  try {
    const report = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.activity_report,
            status: ActivityReportStatus.PUBLISHED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.ACTIVITY_REPORT_NOT_FOUND,
    })

    const user = await this.userService.documentExists({
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

    let parent = null

    if (payload.parent) {
      parent = await this.activityReportCommentsRepository.findOne({
        where: {
          id: payload.parent,
        },
        select: ['id'],
      })

      if (!parent) {
        throw new BadRequestException(ErrorKey.ACTIVITY_REPORT_COMMENT_NOT_FOUND)
      }
    }

    const mentions = this.extractMentions(payload.comment)

    const mentioned_users = mentions.length
      ? await this.userService.userRepository
          .createQueryBuilder('user')
          .where('"user"."username" IN (:...usernames)', { usernames: mentions })
          .andWhere('"user"."account_status" = :accountStatus', {
            accountStatus: AccountStatus.ENABLED,
          })
          .getMany()
      : []

    const comment = await this.activityReportCommentsRepository.save({
      ...payload,
      user,
      activity_report: report,
      parent,
      mentioned_users,
    })

    return {
      success: true,
      message: 'Comment successfully created',
      data: comment,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
