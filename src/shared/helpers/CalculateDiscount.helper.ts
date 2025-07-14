import { CouponDiscountType, CouponType } from '@app/src/admin/coupons/enums'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'

/**
 * Calculates the discount value of a coupon based on the given cart.
 * @param coupon The coupon to calculate the discount for.
 * @param cart The cart to calculate the discount for.
 * @returns The calculated discount value.
 */
export async function CalculateDiscount(coupon: CouponsEntity, details): Promise<number> {
  let discount = 0

  switch (coupon.coupon_type) {
    case CouponType.FIXED:
      discount = coupon.discount
      break
    case CouponType.PERCENTAGE:
      discount = (details.total * coupon.discount) / 100
      break
    case CouponType.ITEM_PRICE:
      if (!details.is_buynow && coupon.discount_type === CouponDiscountType.PERCENTAGE) {
        discount = (details.total * coupon.discount) / 100
        break
      }

      if (details.is_buynow && coupon.discount_type === CouponDiscountType.FIXED_AMOUNT) {
        discount = coupon.discount
        break
      }

      discount = details.items.reduce((acc, item) => {
        const itemDiscount =
          coupon.discount_type === CouponDiscountType.PERCENTAGE
            ? (item.total * coupon.discount) / 100
            : coupon.discount
        return acc + itemDiscount
      }, 0)

      break
    case CouponType.TOTAL_ORDER:
      if (coupon.discount_type === CouponDiscountType.PERCENTAGE) {
        discount = (details.total * coupon.discount) / 100
      } else {
        discount = coupon.discount
      }

      break
    case CouponType.FREE_SHIPPING:
      // discount = cart.shippingFee
      break
  }

  if (coupon.max_discount) {
    discount = Math.min(discount, coupon.max_discount)
  }

  if (coupon.is_shipping_fee_excluded) {
    // const cartTotalWithoutShipping = cart.total - cart.shippingFee
    // discount = Math.min(discount, cartTotalWithoutShipping)
  }

  if (coupon.exclude_shipping_fee > 0) {
    // const maxDiscountWithoutShipping = cart.total - cart.shippingFee - coupon.exclude_shipping_fee
    // discount = Math.min(discount, maxDiscountWithoutShipping)
  }

  return Math.max(discount, 0)
}
