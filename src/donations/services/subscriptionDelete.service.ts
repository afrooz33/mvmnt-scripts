import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DonationStatus } from '@app/src/donations/enums'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'

export default async function (event): Promise<SuccessRO> {
  try {
    if (event.object.status !== 'canceled') {
      return event
    }

    const { object } = event
    const donation_id = object.metadata.donation_id

    if (!donation_id) {
      return {
        success: false,
        message: 'Donation id not found',
        data: event,
      }
    }

    const donation: UserDonationsEntity = await this.updateOne({
      id: donation_id,
      donation_cancel_date: new Date(),
      status: DonationStatus.CANCELLED,
    })

    return {
      success: true,
      message: 'Recurring donation cancelled',
      data: donation,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
