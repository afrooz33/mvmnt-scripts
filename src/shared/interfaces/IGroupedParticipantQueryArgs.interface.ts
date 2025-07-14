import { DealType } from '@app/src/users/deal/enums'

export default interface IGroupedParticipantQueryArgs {
  name: string
  table: string
  alias: string
  filters: string[]
  groupBy: string[]
  dealType: DealType
  dateColumn: string
  selectFields: string[]
  // dayGroupBySelect: string
  dateRange: { start: string; end: string }
}
