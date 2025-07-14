import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { StarType } from '@app/src/users/stars/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { ContributionStarsEventPayload } from '@app/src/users/stars/interfaces'

export default async function (payload: ContributionStarsEventPayload): Promise<void> {
  try {
    const { userId, action, metadata } = payload

    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const stars = await this.calculateContributionStars(action)

    await this.userStarsRepository.save({
      user: {
        id: user.id,
      },
      stars,
      type: StarType.CONTRIBUTION,
      action,
      ...(metadata.cart && { cart: metadata.cart }),
      ...(metadata.donation_payment && { donation_payment: metadata.donation_payment }),
      ...(metadata.deal && { deal: metadata.deal }),
      ...(metadata.nonprofit && { nonprofit: metadata.nonprofit }),
      ...(metadata.donation_project && { donation_project: metadata.donation_project }),
      ...(metadata.fundraiser && { fundraiser: metadata.fundraiser }),
      ...(metadata.invitation && { invitation: metadata.invitation }),
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
