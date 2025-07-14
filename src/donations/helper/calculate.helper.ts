import BigNumber from 'bignumber.js'
import { DonationType } from '@app/src/users/deal/enums'

export const calculateDonation = (
  donation_type: DonationType,
  donation_value: number,
  quantity: number,
  price: number,
) => {
  let total_donation = new BigNumber(0)

  const total_amount = quantity * price
  switch (donation_type) {
    case DonationType.FIXED_PER_ORDER:
      total_donation = BigNumber(donation_value)
      break
    case DonationType.FIXED_PER_ITEM:
    case DonationType.FIXED_PER_ENTRY:
    case DonationType.MONHTLY_RECURRING:
      total_donation = BigNumber(donation_value).multipliedBy(quantity)
      break
    case DonationType.WINNING_BID_ROUND_UP:
    case DonationType.ROUND_UP_SUB_TOTAL:
      total_donation = BigNumber(Math.ceil(total_amount)).minus(total_amount)
      break
    case DonationType.PERCENTAGE_PER_ORDER:
    case DonationType.FIXED_PERCENTAGE_PER_ITEM:
      total_donation = BigNumber(total_amount).multipliedBy(donation_value).dividedBy(100)
      break
  }

  return total_donation
}
