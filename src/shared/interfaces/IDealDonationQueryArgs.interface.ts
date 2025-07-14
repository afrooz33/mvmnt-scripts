export default interface IDealDonationQueryArgs {
  select?: string
  userId?: string
  dealId?: string
  isDirect?: boolean
  isContribution?: boolean
  includeSystemFees?: boolean
  columnMatchCondition?: string
}
