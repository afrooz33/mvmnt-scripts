import { Not } from 'typeorm'
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
            user: {
              id: userId,
            },
            status: Not(ActivityReportStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.ACTIVITY_REPORT_NOT_FOUND,
    })

    await this.updateOne({
      id,
      status: ActivityReportStatus.DELETED,
    })

    return {
      success: true,
      message: 'Activity report deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
