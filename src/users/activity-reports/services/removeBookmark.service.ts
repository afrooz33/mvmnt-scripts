import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ActivityReportStatus } from '@app/src/users/activity-reports/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: ActivityReportStatus.PUBLISHED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.ACTIVITY_REPORT_NOT_FOUND,
    })

    const bookmarked = await this.activityReportBookmarksRepository.findOne({
      where: {
        activity_report: {
          id,
        },
        user: {
          id: userId,
        },
      },
      select: ['id'],
    })

    if (!bookmarked) {
      throw new NotFoundException(ErrorKey.BOOKMARK_NOT_FOUND)
    }

    await this.activityReportBookmarksRepository.remove(bookmarked)

    return {
      success: true,
      message: 'Bookmark removed successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
