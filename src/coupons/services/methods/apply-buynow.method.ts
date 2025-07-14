import { ForbiddenException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ApplyCodeQueryDto } from '@app/src/coupons/dto'
import {
  CouponType,
  CouponTargetDeal,
  CouponDiscountType,
  PurchaseRequirementType,
} from '@app/src/admin/coupons/enums'

export default async function (
  query: ApplyCodeQueryDto,
  userId: string,
  coupon,
): Promise<SuccessRO> {
  try {
    const { cart, items } = await this.GetCartData(query.cart, userId)

    const eligibleItems = []

    // check if coupon is valid and user can use it,
    // check for start date, end date, max usage, max usage per user, user search conditions
    await this.CheckCouponValidity(coupon, userId)

    if (coupon.target_deal !== CouponTargetDeal.ALL) {
      const eligibleDealIds = coupon.deals_variants.map((dv) => dv.deal?.id)
      const eligibleVariantIds = coupon.deals_variants.map((dv) => dv.variant?.id)

      const cartDealIds = items.map((item) => item.variant.deal_id)
      const cartVariantIds = items.map((item) => item.variant.id)

      if (!cartDealIds.some((id) => eligibleDealIds.includes(id))) {
        throw new ForbiddenException(ErrorKey.CART_CONTAINS_INVALID_DEAL)
      }

      if (!cartVariantIds.every((id) => eligibleVariantIds.includes(id))) {
        throw new ForbiddenException(ErrorKey.CART_CONTAINS_INVALID_DEAL)
      }

      items.forEach((item) => {
        coupon.deals_variants.forEach((deals_variant) => {
          if (deals_variant.variant === null && deals_variant.deal.id === item.variant.deal_id) {
            eligibleItems.push(item)
          } else if (deals_variant.variant.id === item.variant.id) {
            eligibleItems.push(item)
          }
        })
      })

      if (!eligibleItems.length) {
        throw new ForbiddenException(ErrorKey.CART_CONTAINS_INVALID_DEAL)
      }

      if (coupon.purchase_requirement_type === PurchaseRequirementType.MINIMUM_PURCHASE) {
        if (eligibleItems.some((item) => item.total < coupon.purchase_requirement)) {
          throw new ForbiddenException(ErrorKey.COUPON_MINIMUM_PURCHASE_REQUIREMENT_NOT_MET)
        }
      }

      if (coupon.purchase_requirement_type === PurchaseRequirementType.MINIMUM_QUANTITY) {
        if (eligibleItems.some((item) => item.quantity < coupon.purchase_requirement)) {
          throw new ForbiddenException(ErrorKey.COUPON_MINIMUM_QUANTITY_REQUIREMENT_NOT_MET)
        }
      }
    }

    if (coupon.target_deal === CouponTargetDeal.ALL) {
      items.forEach((item) => {
        eligibleItems.push(item)
      })
    }

    let cartDiscount = 0

    if (coupon.coupon_type === CouponType.TOTAL_ORDER) {
      if (coupon.discount_type === CouponDiscountType.PERCENTAGE) {
        cartDiscount = (cart.total * coupon.discount) / 100
      } else if (coupon.discount_type === CouponDiscountType.FIXED_AMOUNT) {
        cartDiscount = coupon.discount
      }
    }

    if (coupon.coupon_type === CouponType.ITEM_PRICE) {
      for (const item of eligibleItems) {
        let discountAmount

        if (coupon.discount_type === CouponDiscountType.PERCENTAGE) {
          discountAmount = (item.total * coupon.discount) / 100
        } else if (coupon.discount_type === CouponDiscountType.FIXED_AMOUNT) {
          discountAmount = coupon.discount
        }

        const maxDiscountAmount =
          coupon.max_discount !== null ? coupon.max_discount : discountAmount
        const finalDiscountAmount = Math.min(discountAmount, maxDiscountAmount)

        item.discount = finalDiscountAmount

        cartDiscount += finalDiscountAmount

        await this.buynowService.buyNowCartItemRepository.update(item.id, {
          discount: finalDiscountAmount,
        })
      }
    }

    if (coupon.coupon_type === CouponType.FREE_SHIPPING) {
      for (const item of eligibleItems) {
        await this.buynowService.buyNowCartItemRepository.update(item.id, {
          shipping_price: 0,
        })
      }
    }

    await this.buynowService.updateOne({
      id: query.cart,
      coupon,
      total_discount: cartDiscount,
    })

    return {
      success: true,
      message: 'Coupon applied successfully',
      data: cart,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
