import { DealType } from '@app/src/users/deal/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { SystemFeeEntity } from '@app/src/admin/system-fee/entities/system-fee.entity'

export default function getSystemFee(
  user: UserEntity,
  deal_type: DealType,
  systemFee: SystemFeeEntity,
): number {
  if (user?.account_type?.toString().includes('INDIVIDUAL_')) {
    switch (deal_type) {
      case DealType.AUCTION:
        return systemFee.auction_fee
      case DealType.RAFFLE:
        return systemFee.raffle_fee
      case DealType.BUYNOW:
        return systemFee.buynow_fee
      default:
        return systemFee.default_fee
    }
  } else if (user?.account_type?.toString().includes('BUSINESS_')) {
    switch (deal_type) {
      case DealType.AUCTION:
        return systemFee.bussiness_auction_fee
      case DealType.RAFFLE:
        return systemFee.bussiness_raffle_fee
      case DealType.BUYNOW:
        return systemFee.bussiness_buynow_fee
      default:
        return systemFee.default_fee
    }
  } else {
    return systemFee.default_fee
  }
}
