import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ActivityReportStatus } from '@app/src/users/activity-reports/enums'
import { UpdateActivityReportsDto } from '@app/src/users/activity-reports/dto'

export default async function (
  payload: UpdateActivityReportsDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
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

    return await this.create(payload, userId)
  } catch (error) {
    return HandleErrors(error)
  }
}
