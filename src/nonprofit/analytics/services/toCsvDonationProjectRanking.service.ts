import { ICsvDonationProjectRanking } from '@app/src/shared/interfaces'

export default function (ranking: any): ICsvDonationProjectRanking {
  return {
    'Donation project name': ranking.donation_project_name,
    'Total donation': ranking.total_donation,
    'Total direct donation': ranking.total_direct_donation,
    'Total direct donation count': ranking.total_direct_donation_count,
    'Total donation on deal': ranking.total_deal_donation,
    'Total donation on deal count': ranking.total_deal_donation_count,
  }
}
