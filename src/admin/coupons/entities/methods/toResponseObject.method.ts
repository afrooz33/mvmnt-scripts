import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'

export default function (): CouponsEntity {
  const responseObject: any = {
    id: this.id,
    code: this.code,
    display_order: Number(this.display_order),
    name: this.name,
    description: this.description,
    coupon_type: this.coupon_type,
    start_date: this.start_date,
    end_date: this.end_date,
    discount: Number(this.discount),
    max_discount: Number(this.max_discount),
    min_order_amount: Number(this.min_order_amount),
    max_usage: Number(this.max_usage),
    target_user: this.target_user,
    user_selection_mode: this.user_selection_mode,
    user_search_conditions: this.user_search_conditions,
    target_deal: this.target_deal,
    target_country: this.target_country,
    max_usage_per_user: Number(this.max_usage_per_user),
    max_shipping_fee: Number(this.max_shipping_fee),
    is_shipping_fee_excluded: this.is_shipping_fee_excluded,
    exclude_shipping_fee: Number(this.exclude_shipping_fee),
    status: this.status,
    updated: this.updated,
    created: this.created,
  }

  if (this.translations) {
    responseObject.translations = this.translations
  }

  return responseObject
}
