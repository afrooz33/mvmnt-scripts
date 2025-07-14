export default interface IGetRe2SourceDonationArgs {
  re2Id: string
  select?: string
  isDirect?: boolean
  nonprofitId?: string
  dateFilter?: {
    end?: string
    start?: string
  }
}
