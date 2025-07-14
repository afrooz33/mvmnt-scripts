import { Not } from 'typeorm'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

export default async function (id: string, userId: string, donationSourceId: string): Promise<any> {
  try {
    const donation_project: DonationProjectEntity = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(Status.DELETED),
          },
          select: ['id', 'name', 'status', 'introduction'],
        },
      ],
      errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
    })

    const donation_source: DealEntity = await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: donationSourceId,
            status: Not(Status.DELETED),
          },
          select: ['id', 'name', 'status', 'deal_type', 'description'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    return {
      donation_project,
      donation_source,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
