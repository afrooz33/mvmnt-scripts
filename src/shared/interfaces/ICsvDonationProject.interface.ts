export default interface ICsvDonationProject {
  'Donation project ID': string
  Name: string
  Introduction: string
  'Schedule status': string
  'Schedule date': Date | null
  'Deadline status': string
  'Deadline date': Date | null
  'Goal status': string
  'Goal amount': number | null
  Tags: string | null
  'Published date': Date | null
  'Admin memo': string
  'Created date': Date
  'Review status': string
  Status: string
  'Total donation': number
  'Gross donation': number
  'Total donor': number
  'Total deal donation': number
  'Total direct donation': number
  'Total RE2 donation': number
}
