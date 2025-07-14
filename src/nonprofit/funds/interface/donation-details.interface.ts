import BigNumber from 'bignumber.js'

export interface DonationDetails {
  id: string
  vault_address: string
  currency: string
  project: string
  donation: BigNumber
  amount: BigNumber
  dealGasFees: BigNumber
  donationGasFees: BigNumber
  systemFees: BigNumber
  adminShare: BigNumber
}
