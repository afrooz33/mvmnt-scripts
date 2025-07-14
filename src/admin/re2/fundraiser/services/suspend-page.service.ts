import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { FundraiserStatus, FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (id: string): Promise<SuccessRO> {
  try {
    const page = await this.documentExists({
      condition: [
        {
          where: {
            id,
            type: FundraiserType.PAGE,
            status: In([
              FundraiserStatus.HIDDEN,
              FundraiserStatus.CONFIRMED,
              FundraiserStatus.PUBLISHED,
            ]),
          },
          relations: [Query.USER, Query.USER_PROFILE],
          select: {
            id: true,
            title: true,
            status: true,
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

    this.donationService.cancelRecurring({
      id,
      isFundraiser: true,
    })

    await this.updateOne({
      id,
      old_status: page.status,
      status: FundraiserStatus.SUSPENDED,
    })

    //send email to user notification email when page suspended
    const email = page.user?.profile?.notification_email || page.user?.email

    this.mailService.fundraiserPageSuspended({
      email,
      title: page.title,
      username: `${page.user?.profile?.first_name} ${page.user?.profile?.last_name}`,
    })

    return {
      success: true,
      message: 'Fundraiser page successfully suspended',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
