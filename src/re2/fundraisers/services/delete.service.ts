import { Not } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'

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
            status: Not(FundraiserStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_FUNDRAISER_NOT_FOUND,
        args: { id },
      }),
    })

    await this.fundraiserRepository.update(
      {
        id,
        user: {
          id: userId,
        },
      },
      {
        status: FundraiserStatus.DELETED,
      },
    )

    return {
      success: true,
      message: 'Fundraiser form or page successfully deleted',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
