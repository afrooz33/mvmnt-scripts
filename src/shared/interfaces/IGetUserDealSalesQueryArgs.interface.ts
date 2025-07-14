import { DealType } from '@app/src/users/deal/enums'

export default interface IGetUserDealSalesQueryArgs {
  userId: string
  select?: string
  isPurchase?: boolean
  dealType?: DealType[] | null
}
