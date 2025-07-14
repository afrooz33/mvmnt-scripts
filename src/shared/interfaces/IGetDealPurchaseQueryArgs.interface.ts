import { DealType } from '@app/src/users/deal/enums'

export default interface IGetDealPurchaseQueryArgs {
  alias?: string
  select?: string
  userId?: string
  dealId?: string
  dealType?: DealType | DealType[]
  dateFilter?: {
    start?: string
    end?: string
  }
}
