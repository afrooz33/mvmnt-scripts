import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/re2/user/enums'

export default async function (id: string): Promise<SuccessRO> {
  try {
    const user = await this.documentExists({
      condition: [
        {
          where: {
            id,
            account_status: AccountStatus.DEACTIVATED,
          },
          relations: [Query.PROFILE],
          select: {
            id: true,
            email: true,
            profile: {
              first_name: true,
              last_name: true,
              notification_email: true,
            },
          },
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    user.account_status = AccountStatus.ACTIVE

    await this.updateOne(user)

    const email = user?.profile?.notification_email || user?.email

    this.mailService.re2UserAccountStatusUpdated({
      email,
      username: `${user?.profile?.first_name} ${user?.profile?.last_name}`,
      action: 'reactivated',
    })

    await this.reactivateFundraisers(id)
    await this.reactivateIntegrations(id)

    return {
      success: true,
      message: 'User reactivated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
