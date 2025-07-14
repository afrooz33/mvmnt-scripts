import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (deal) {
  try {
    const users = await this.recurringDonationService.cancelRecurring({
      id: deal.id,
      isDeal: true,
    })

    if (!users.length) {
      return
    }

    await this.notifyParticipants(users, deal)
  } catch (error) {
    return HandleErrors(error)
  }
}
