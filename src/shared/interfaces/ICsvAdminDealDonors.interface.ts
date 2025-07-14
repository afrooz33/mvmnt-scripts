export default interface ICsvAdminDealDonors {
  UserId: string
  'Deal name': string
  Username: string
  'Deal type': string
  'Display name': string
  'Account type': string
  'Payment method type': string
  'Total purchase': string
  'Purchase date': string | Date
  'Total donation': string | null
  'Net donation': string | null
}
