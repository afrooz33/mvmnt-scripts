import { DonationType } from '@app/src/donations/enums'

export default interface IUserDonationProjectDonationQueryArgs {
  select?: string
  userId?: string
  isDirect?: boolean
  isNonprofit?: boolean
  donationProjectId?: string
  nonprofitId?: string
  query?: {
    date_filter: {
      start: string
      end: string
    }
  }
  reason?: DonationType[] | DonationType | undefined
  isAll?: boolean
}
