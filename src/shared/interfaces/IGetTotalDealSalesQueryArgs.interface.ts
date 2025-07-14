import { DealType } from '@app/src/users/deal/enums'

export default interface IGetTotalDealSalesQueryArgs {
  select?: string
  userId?: string
  dealId?: string
  groupBy?: string
  isContribution?: boolean
  dealType?: DealType | DealType[]
}
