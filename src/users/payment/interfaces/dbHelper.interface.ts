import BigNumber from 'bignumber.js'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'

export interface DBHelper {
  deal: DealEntity
  deal_variant?: DealVariantEntity
  buyer: UserEntity
  seller: UserEntity
  quantity: number
  deal_amount: BigNumber
  donation_amount: BigNumber
  payment_currency: string
  points_note?: object
  reselling_link?: ResellingLinkEntity
  conversion_rate_to_fiat: BigNumber
  fiat_currency_symbol: string
  payment_currency_symbol: string
  fiat_equivalent_token_amount: BigNumber
}
