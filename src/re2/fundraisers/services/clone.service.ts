import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'

export default async function cloneService(id: string, userId: string): Promise<SuccessRO> {
  try {
    const fundraiser = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(FundraiserStatus.DELETED),
          },
          relations: [Query.IMAGES, Query.NONPROFIT, Query.DONATION_PROJECTS],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_FUNDRAISER_NOT_FOUND,
        args: { id },
      }),
    })

    fundraiser.id = undefined
    fundraiser.status = FundraiserStatus.DRAFT
    fundraiser.public_url = `${fundraiser.public_url}-clone`

    const totalFundraiser = await this.fundraiserRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    })

    fundraiser.public_url = `${fundraiser.public_url}-${totalFundraiser + 1}`

    await this.fundraiserRepository.save({
      ...fundraiser,
      user: {
        id: userId,
      },
    })

    return {
      success: true,
      message: 'Fundraiser cloned successfully',
      data: fundraiser,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
