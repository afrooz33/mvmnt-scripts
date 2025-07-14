import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateFundraiserDto } from '@app/src/re2/fundraisers/dto'

export default async function (payload: UpdateFundraiserDto, userId: string): Promise<SuccessRO> {
  try {
    const fundraiser = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
            user: {
              id: userId,
            },
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_FUNDRAISER_NOT_FOUND,
        args: { id: payload.id },
      }),
    })

    if (fundraiser.type !== payload.type) {
      throw new PreconditionFailedException(ErrorKey.RE2_FUNDRAISER_TYPE_UPDATE_NOT_ALLOWED)
    }

    await this.create(payload, userId, payload.id)

    return {
      success: true,
      message: 'Fundraiser updated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
