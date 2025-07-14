import { DonationType } from '@app/src/donations/enums'

export default interface IUserDonation {
  select?: string
  userId?: string
  dealId?: string
  isDirect?: boolean
  isAll?: boolean
  isContribution?: boolean
  reason?: DonationType | DonationType[]
}
