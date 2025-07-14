export default interface IGetDealStatsQueryArgs {
  select?: string
  userId?: string
  dealId?: string
  dealType?: string
  dateFilter?: {
    start?: string
    end?: string
  }
  columnMatchCondition?: string
  additionalJoins?: string
  additionalWhere?: string
}
