import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default function (): DealEntity {
  const responseObject: any = {
    id: this.id,
    name: this.name,
    deal_type: this.deal_type,
    item_condition: this.item_condition,
    shipping_covered_by: this.shipping_covered_by,
    size: this.size,
    category: this.category,
    brand: this.brand,
    start_date: this.start_date,
    end_date: this.end_date,
    description: this.description,
    starting_price: this.starting_price,
    status: this.status,
    user: this.user,
    images: this.images,
    options: this.options,
    variants: this.variants,
    raffles: this.raffles,
    bids: this.bids,
    donation_type: this.donation_type,
    donation_amount: this.donation_amount,
    currency: this.currency,
    total_bids: this.total_bids,
    participants: this.participants,
    current_bid: this.current_bid,
    total_donation: this.total_donation,
    net_donation: this.net_donation,
    total_sales: this.total_sales,
    admin_memo: this.admin_memo,
    shipping_fee: this.shipping_fee,
    shipping_method: this.shipping_method,
    sender_location: this.sender_location,
    estimated_delivery_days: this.estimated_delivery_days,
    updated: this.updated,
    created: this.created,
    reviews: this.reviews,
    deal_reviews: this.deal_reviews,
    is_one_of_kind: this.is_one_of_kind,
    purchase_availability: this.purchase_availability,
    deal_availability: this.deal_availability,
    deal_access_date: this.deal_access_date,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.images) {
    responseObject.images = this.images
  }

  if (this?.donation_project?.id) {
    responseObject.donation_project = this.donation_project.toResponseObject()
  }

  if (this.updateNotes) {
    responseObject.updateNotes = this.updateNotes
  }

  if (this?.donation_nonprofit?.id) {
    responseObject.donation_nonprofit = this.donation_nonprofit.toResponseObject()
  }

  return responseObject
}
