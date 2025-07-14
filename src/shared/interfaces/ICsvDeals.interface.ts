export default interface ICsvDeals {
  Name: string
  User: string
  'Deal type': string
  Description: string
  'Start date': Date | string
  'End date': Date | string
  'Total bids': string | number
  Participant: string | number
  'Total sales': string | number
  'Current bid': string | number
  'Gross donation': string | number
  'Net donation': string | number
  'Buynow purchase': string | number
}
