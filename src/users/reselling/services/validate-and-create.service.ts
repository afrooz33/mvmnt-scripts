import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import {
  DealAllowReselling,
  DealResellingAmountType,
  DealResellingCap,
} from '@app/src/users/deal/enums'

export default async function (resellerId: string, cartId: string) {
  try {
    const reseller = await this.userRepository.findOne({
      where: {
        id: resellerId,
        account_status: AccountStatus.ENABLED,
        account_type: In([UserAccountType.INDIVIDUAL_INFLUENCER]),
      },
      select: ['id'],
    })

    const cart = await this.cartRepository.findOne({
      where: {
        id: cartId,
        status: In([CartStatus.SHIPPED, CartStatus.COMPLETED, CartStatus.WAITING_SHIPMENT]),
        user: Not({ id: reseller.id }),
      },
      relations: [Query.ITEMS, `${Query.ITEMS}.${Query.DEAL}`, `${Query.ITEMS}.${Query.VARIANT}`],
    })

    if (!cart) {
      throw new BadRequestException(ErrorKey.INVALID_CART)
    }

    let totalRewardAmount = 0
    const currentDate = new Date()

    for (const cartItem of cart.cartItems) {
      const deal = cartItem.deal
      const variant = cartItem.variant
      const itemQuantity = cartItem.quantity
      const itemTotalAmount = cartItem.totalAmount

      if (deal.allow_reselling !== DealAllowReselling.ENABLE) {
        continue // Skip this item if reselling is not allowed
      }

      let allowedQuantity = itemQuantity
      let allowedAmount = itemTotalAmount

      switch (deal.reselling_cap) {
        case DealResellingCap.LIMIT_RESELLING_PERIOD:
          const expiredAt = new Date(deal.reselling_cap_value).getTime()

          if (expiredAt < currentDate.getTime()) {
            continue
          }

          break

        case DealResellingCap.LIMIT_SALE_AMOUNT_PER_VARIANT:
          const capValueAmount = Number.parseFloat(deal.reselling_cap_value)
          const currentVariantSalesAmount = await getCurrentVariantSalesAmount(deal.id, variant.id)
          const remainingAmount = capValueAmount - currentVariantSalesAmount

          if (remainingAmount <= 0) {
            continue
          }

          allowedAmount = Math.min(allowedAmount, remainingAmount)

          break

        case DealResellingCap.LIMIT_SALE_QUANTITY_PER_VARIANT:
          const capValueQuantity = Number.parseInt(deal.reselling_cap_value, 10)
          const currentVariantSalesQuantity = await getCurrentVariantSalesQuantity(
            deal.id,
            variant.id,
          )
          const remainingQuantity = capValueQuantity - currentVariantSalesQuantity

          if (remainingQuantity <= 0) {
            continue
          }

          allowedQuantity = Math.min(itemQuantity, remainingQuantity)

          allowedAmount = (allowedQuantity / itemQuantity) * itemTotalAmount

          break
      }

      const rewardAmount = await calculateReward(deal, allowedAmount)
      totalRewardAmount += rewardAmount

      await this.rewardRepository.save({
        reseller: { id: resellerId },
        deal: { id: deal.id },
        variant: { id: variant.id },
        cart: { id: cart.id },
        purchase_amount: allowedAmount,
        reward_amount: rewardAmount,
      })
    }

    return { totalRewardAmount }
  } catch (error) {
    return HandleErrors(error)
  }
}

/**
 * Calculates the reward amount based on the reselling settings of a deal
 * @param deal - The deal entity
 * @param allowedAmount - The allowed amount for reselling
 * @returns The calculated reward amount
 */
async function calculateReward(deal, allowedAmount: number): Promise<number> {
  switch (deal.reselling_amount_type) {
    case DealResellingAmountType.FIXED_PER_AMOUNT:
      const fixedFee = Number.parseFloat(deal.reselling_fee)

      return Math.floor(allowedAmount / 100) * fixedFee

    case DealResellingAmountType.PERCENTAGE:
      const percentage = Number.parseFloat(deal.reselling_fee)

      return (allowedAmount * percentage) / 100

    default:
      return 0
  }
}

/**
 * Calculates the total sales amount for a variant of a deal
 * @param dealId - The deal id
 * @param variantId - The variant id
 * @returns The total sales amount
 */
async function getCurrentVariantSalesAmount(dealId: string, variantId: string): Promise<number> {
  const result = await this.rewardRepository
    .createQueryBuilder('reward')
    .select('SUM(reward.purchase_amount)', 'totalAmount')
    .where('reward.deal.id = :dealId', { dealId })
    .andWhere('reward.variant.id = :variantId', { variantId })
    .getRawOne()

  return Number(result.totalAmount) || 0
}

/**
 * Calculates the total sales quantity for a variant of a deal
 * @param dealId - The deal id
 * @param variantId - The variant id
 * @returns The total sales quantity
 */
async function getCurrentVariantSalesQuantity(dealId: string, variantId: string): Promise<number> {
  const result = await this.rewardRepository
    .createQueryBuilder('reward')
    .select('SUM(reward.purchase_amount / deal.unit_price)', 'totalQuantity')
    .innerJoin('reward.deal', 'deal')
    .where('reward.deal.id = :dealId', { dealId })
    .andWhere('reward.variant.id = :variantId', { variantId })
    .getRawOne()

  return Math.floor(Number(result.totalQuantity)) || 0
}
