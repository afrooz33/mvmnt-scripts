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
            account_status: AccountStatus.ACTIVE,
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

    user.account_status = AccountStatus.DEACTIVATED

    await this.updateOne(user)

    const email = user?.profile?.notification_email || user?.email

    this.mailService.re2UserAccountStatusUpdated({
      email,
      username: `${user?.profile?.first_name} ${user?.profile?.last_name}`,
      action: 'deactivated',
    })

    await this.deactivateFundraisers(id)
    await this.deactivateIntegrations(id)

    const integrations = await this.integrationService.integrationRepository.find({
      where: {
        user: { id },
      },
      select: {
        id: true,
      },
    })

    const fundraisers = await this.fundraiserService.fundraiserRepository.find({
      where: {
        user: { id },
      },
      select: {
        id: true,
      },
    })

    const referenceIds = [
      ...integrations.map((integration) => integration.id),
      ...fundraisers.map((fundraiser) => fundraiser.id),
    ]

    const users = await this.donationsService.cancelRecurring({
      id: referenceIds,
      isRE2: true,
    })

    for (const user of users) {
      this.mailService.re2UserAccountStatusUpdated({
        email: user.email,
        username: user.display_name,
        action: 'account_blocked',
      })
    }

    return {
      success: true,
      message: 'User deactivated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
