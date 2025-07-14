export default interface ICsvDonations {
  Username: string
  'User account type': string
  'Deal name': string | null
  'Deal type': string | null
  'Donation project': string
  'Donation frequency': string
  'Donation amount': number
  'Donation date': Date
}
