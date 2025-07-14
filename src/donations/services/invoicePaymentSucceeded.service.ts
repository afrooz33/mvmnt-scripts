import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DonationFrequency, DonationStatus } from '@app/src/donations/enums'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'

export default async function (event): Promise<SuccessRO> {
  try {
    if (event.object.status !== 'paid') {
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

    const parentDonation: UserDonationsEntity = await this.documentExists({
      condition: [
        {
          where: {
            id: donation_id,
            donation_frequency: DonationFrequency.RECURRING,
          },
        },
      ],
      message: ErrorKey.DOATION_NOT_FOUND,
    })

    const donation: UserDonationsEntity = await this.updateOne({
      ...parentDonation,
      parent: parentDonation,
      payment_charge_id: object.charge,
      status: DonationStatus.SUCCESS,
    })

    return {
      success: true,
      message: 'Recurring donation saved successfully',
      data: donation,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
