import {
  CouponType,
  CouponTargetUser,
  CouponDiscountType,
  CouponTargetCountry,
  PurchaseRequirementType,
} from '@app/src/admin/coupons/enums'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'

export function GenerateCouponDescription(coupon: CouponsEntity): string {
  const {
    discount,
    coupon_type,
    discount_type,
    max_usage,
    max_usage_per_user,
    target_user,
    purchase_requirement_type,
    purchase_requirement,
    target_country,
    countries,
    deals_variants,
  } = coupon

  let description = ''

  if (discount_type === CouponDiscountType.PERCENTAGE) {
    description += `${discount}% off `
  } else if (discount_type === CouponDiscountType.FIXED_AMOUNT) {
    description += `¥${discount} off `
  }

  if (coupon_type === CouponType.TOTAL_ORDER) {
    description += 'entire order'
  } else if (coupon_type === CouponType.ITEM_PRICE) {
    if (deals_variants && deals_variants.length > 0) {
      description += `${deals_variants.length} item${deals_variants.length > 1 ? 's' : ''}`
    } else {
      description += 'All ITEMS'
    }
  } else if (coupon_type === CouponType.FREE_SHIPPING) {
    description += 'shipping'
  }

  if (
    purchase_requirement_type === PurchaseRequirementType.MINIMUM_PURCHASE &&
    purchase_requirement !== null
  ) {
    description += ` • Minimum purchase of ¥${purchase_requirement}`
  } else if (
    purchase_requirement_type === PurchaseRequirementType.MINIMUM_QUANTITY &&
    purchase_requirement !== null
  ) {
    description += ` • Buy ${purchase_requirement} item${purchase_requirement > 1 ? 's' : ''}`
  }

  if (target_user !== CouponTargetUser.ALL) {
    description += ` • For ${target_user.toLowerCase()} users`
  }

  if (target_country !== CouponTargetCountry.ALL && countries && countries.length > 0) {
    const countryNames = countries.map((c) => c.name).join(', ')
    description += ` • For ${countryNames}`
  }

  if (max_usage !== null) {
    description += ` • ${max_usage} use${max_usage > 1 ? 's' : ''} total`
  }
  if (max_usage_per_user !== null) {
    description += ` • ${max_usage_per_user} use${max_usage_per_user > 1 ? 's' : ''} per customer`
  }

  if (discount_type === CouponDiscountType.PERCENTAGE) {
    if (discount !== null) {
      description += ` • Max discount of ${discount}%`
    }
  } else if (discount_type === CouponDiscountType.FIXED_AMOUNT) {
    if (discount !== null) {
      description += ` • Max discount of ¥${discount}`
    }
  }

  return description.trim()
}
