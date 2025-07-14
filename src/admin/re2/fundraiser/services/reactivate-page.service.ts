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
            status: In([FundraiserStatus.SUSPENDED]),
          },
          relations: [Query.USER, Query.USER_PROFILE],
          select: {
            id: true,
            title: true,
            status: true,
            end_date: true,
            start_date: true,
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

    let status = page.old_status

    if (status === FundraiserStatus.CONFIRMED) {
      const today = new Date().getTime()
      const end_date = page.end_date ? new Date(page.end_date).getTime() : today
      const start_date = page.start_date ? new Date(page.start_date).getTime() : today

      if (today >= start_date) {
        status = FundraiserStatus.PUBLISHED
      }

      if (today >= end_date) {
        status = FundraiserStatus.ENDED
      }
    }

    await this.updateOne({
      id,
      status,
      old_status: null,
    })

    //send email to user notification email when page reactivated
    const email = page.user?.profile?.notification_email || page.user?.email

    this.mailService.fundraiserPageReactivated({
      email,
      title: page.title,
      username: `${page.user?.profile?.first_name} ${page.user?.profile?.last_name}`,
    })

    return {
      success: true,
      message: 'Fundraiser page successfully reactivated',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
