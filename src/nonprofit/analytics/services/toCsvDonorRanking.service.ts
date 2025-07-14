import { ICsvDonorRanking } from '@app/src/shared/interfaces'

export default function (ranking: any): ICsvDonorRanking {
  return {
    'Donor id': ranking.donor_id,
    'Donor username': ranking.donor_username,
    'Donor name': ranking.donor_display_name,
    'Total donation': ranking.total_donation,
    'Donation count': ranking.donation_count,
  }
}
