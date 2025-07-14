export default interface ICsvNonprofitDonationProject {
  'Donation project ID': string
  Name: string
  Introduction: string
  'Schedule status': string
  'Schedule date': Date | null
  'Deadline status': string
  'Deadline date': Date | null
  'Goal status': string
  'Goal amount': number | null
  'Published date': Date | null
  'Created date': Date
  'Review status': string
  Status: string
  'Total donations': number | null
  'Total donors': number | null
}
