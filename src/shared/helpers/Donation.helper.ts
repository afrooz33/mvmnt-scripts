import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType, DonationType } from '@app/src/users/deal/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { SystemFeeEntity } from '@app/src/admin/system-fee/entities/system-fee.entity'
import getSystemFee from './SystemFee.helper'

const validateDonationAmount = (
  deal: DealEntity,
  donationAmount: number,
  totalAmount: number,
  quantity: number,
  variants?: any[],
): boolean => {
  switch (deal.deal_type) {
    case DealType.AUCTION:
    case DealType.RAFFLE:
      return donationAmount < totalAmount
    case DealType.BUYNOW:
      if (variants) {
        return variants.every((variant) => {
          const maxDonationPerVariant = variant.price * quantity
          return donationAmount < maxDonationPerVariant
        })
      }

      return true
    default:
      return true
  }
}

export default async function (
  deal: DealEntity,
  systemFee: SystemFeeEntity,
  user: UserEntity,
  total_amount: number,
  quantity = 1,
  isFixedPerOrderApplied: boolean = false,
  variants?: DealVariantEntity[], // Assuming you pass variants for BUYNOW deal type
): Promise<any> {
  try {
    const donation: any = {}

    // Step 1: Calculate the system fee
    donation.system_fee = getSystemFee(user, deal.deal_type, systemFee)

    // Step 2: Calculate the donation amount based on donation type
    switch (deal.donation_type) {
      case DonationType.FIXED_PER_ORDER:
        if (!isFixedPerOrderApplied) {
          donation.amount = deal.donation_amount
        } else {
          donation.amount = 0
        }
        break
      case DonationType.PERCENTAGE_PER_ORDER:
        donation.amount = Number.parseFloat(
          ((total_amount * deal.donation_amount) / 100).toFixed(2),
        )
        break
      case DonationType.WINNING_BID_ROUND_UP:
        donation.amount = Number.parseFloat((Math.ceil(total_amount) - total_amount).toFixed(2))
        break
      case DonationType.FIXED_PER_ENTRY:
        donation.amount = deal.donation_amount * quantity
        break
      case DonationType.FIXED_PER_ITEM:
        donation.amount = deal.donation_amount * quantity
        break
      case DonationType.FIXED_PERCENTAGE_PER_ITEM:
        donation.amount = Number.parseFloat(
          ((total_amount * deal.donation_amount) / 100).toFixed(2),
        )
        break
      case DonationType.ROUND_UP_SUB_TOTAL:
        donation.amount = Number.parseFloat((Math.ceil(total_amount) - total_amount).toFixed(2))
        break
      case DonationType.MONHTLY_RECURRING:
        donation.amount = deal.donation_amount
        break
      default:
        donation.amount = 0
        break
    }

    // Step 3: Validate the donation amount based on deal type
    donation.isValid = validateDonationAmount(
      deal,
      donation.amount, // Donation amount calculated above
      total_amount, // Total amount for the deal (based on type and quantity)
      quantity,
      variants, // Optional variants, required for BuyNow deals
    )

    if (!donation.isValid) {
      throw new BadRequestException(ErrorKey.INVALID_DONATION_AMOUNT)
    }

    // Step 4: Calculate the net donation amount after system fee deduction
    donation.net_amount = Number.parseFloat(
      ((donation.amount * (100 - donation.system_fee)) / 100).toFixed(2),
    )

    return donation
  } catch (error) {
    // Handle errors via the helper
    return HandleErrors(error)
  }
}
