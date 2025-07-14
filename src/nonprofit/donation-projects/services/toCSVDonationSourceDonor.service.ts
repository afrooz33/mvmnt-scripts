import { ICsvDonationSourceDonor } from '@app/src/shared/interfaces'

export default function (donation: any): ICsvDonationSourceDonor {
  return {
    'Donor id': donation?.donor_id,
    'Donor name': donation?.donor_display_name,
    Username: donation?.donor_username,
    'Donation amount': donation.data_amount,
    'Donation frequency': donation.data_donation_frequency,
    'Donation date': donation.data_created,
  }
}
