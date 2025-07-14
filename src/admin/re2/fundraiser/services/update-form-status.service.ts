import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (id: string, action: string): Promise<SuccessRO> {
  try {
    let old_status = null
    let updatedStatus = FundraiserStatus.SUSPENDED
    let status = [FundraiserStatus.HIDDEN, FundraiserStatus.CONFIRMED, FundraiserStatus.PUBLISHED]

    if (action === 'reactivated') {
      status = [FundraiserStatus.SUSPENDED]
      updatedStatus = FundraiserStatus.DISABLED
    }

    const page = await this.documentExists({
      condition: [
        {
          where: {
            id,
            type: FundraiserType.FORM,
            status: In(status),
          },
          relations: [Query.USER, Query.USER_PROFILE],
          select: {
            id: true,
            title: true,
            status: true,
            old_status: true,
            user: {
              id: true,
              email: true,
              profile: {
                first_name: true,
                last_name: true,
                notification_email: true,
              },
            },
          },
        },
      ],
      errorMessage: ErrorKey.RE2_FUNDRAISER_PAGE_NOT_FOUND,
    })

    if (action === 'suspended') {
      old_status = page.status

      this.donationService.cancelRecurring({
        id,
        isFundraiser: true,
      })
    }

    await this.updateOne({
      id,
      old_status,
      status: updatedStatus,
    })

    const email = page.user?.profile?.notification_email || page.user?.email

    this.mailService.fundraiserFormStatusUpdate({
      email,
      title: page.title,
      username: `${page.user?.profile?.first_name} ${page.user?.profile?.last_name}`,
      action,
    })

    return {
      success: true,
      message: `Fundraiser form successfully ${action}`,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
