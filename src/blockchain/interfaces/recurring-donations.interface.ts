import BigNumber from 'bignumber.js'

export interface RecurringDonationDetails {
  donor: string
  amount: BigNumber
  token: string
  precision: number
  nonprofitVault: string
  paymentIds: string[]
  totalMonths: number
  executionScheduledAfter: number[]
}

export interface DonationEntries {
  donor: string
  nonprofitVault: string
  token: string
  paymentToken: string
  amount: BigNumber
  scheduledExecution: number
  paymentId: string
  leafHash: string
  proof: string
}

export interface RecurringDonationInput {
  donor: string
  nonprofitVault: string
  token: string
  amount: BigNumber
  points: BigNumber
  paymentId: BigNumber
  expiry: number
  sign: string
  path: string[]
  donationRoot: string
  donationProof: string[]
  executionScheduledAfter: number
}
