import { UserAccountType } from '@app/src/users/user/enums'
import { ICsvUserDonations } from '@app/src/shared/interfaces'
import { DonationFrequency, DonationType } from '@app/src/donations/enums'

export default function (donation: any): ICsvUserDonations {
  return {
    'Donor id': donation?.donor_id,
    Name: donation?.donor_display_name,
    Username: donation?.donor_username,
    'Account type': UserAccountType[donation?.donor_account_type],
    'Deal name': donation?.deal_name,
    'Donation type': DonationType[donation?.data_donation_type],
    'Donation frequency': DonationFrequency[donation?.data_donation_frequency],
    'Donation amount': donation?.data_net_amount,
    'Donation date': donation?.data_created,
  }
}
