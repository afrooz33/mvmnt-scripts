import { ICsvAgeGenderDonator } from '@app/src/shared/interfaces'

export default function (ranking: any): ICsvAgeGenderDonator {
  return {
    'Age group': ranking.age_group,
    Gender: ranking.gender,
    'Total donation count': ranking.donation_count,
    Ratio: ranking.ratio,
  }
}
