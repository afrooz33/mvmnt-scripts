export default interface IGenerateDateRangeFilterArgs {
  query: {
    date_filter: {
      start: string
      end: string
    }
  }
  field: string
  alias?: string
  isAppend?: boolean
  condition?: string
}
