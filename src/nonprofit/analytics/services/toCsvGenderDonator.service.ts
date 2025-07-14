import { ICsvGenderDonator } from '@app/src/shared/interfaces'

export default function (ranking: any): ICsvGenderDonator {
  return {
    Gender: ranking.gender,
    'Total donation count': ranking.donation_count,
    Ratio: ranking.ratio,
  }
}
