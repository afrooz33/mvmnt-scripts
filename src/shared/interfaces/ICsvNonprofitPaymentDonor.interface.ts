export default interface ICsvNonprofitPaymentDonor {
  'Donor id': string
  'Donor username': string | null
  'Donor display name': string | null
  'Donation amount': string
  'Donation frequency': string
  'Donation date': string
  'Donation method': string
  'Payment currency id': string
  'Payment currency': string
  'Foundation name': string | null
  'Donation project name': string | null
  'Deal name': string | null
}
