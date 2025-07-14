import { DealBidRO } from '@app/src/users/deal/bid/dto'

export default function (): DealBidRO {
  const responseObject: Partial<DealBidRO> = {
    id: this.id,
    bid_amount: this.bid_amount,
    quantity: this.quantity,
    delivery_cost: this.delivery_cost,
    total_amount: this.total_amount,
    purchase_date: this.purchase_date,
    status: this.status,
    created: this.created,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.deal) {
    responseObject.deal = this.deal.toResponseObject()
  }

  return responseObject as DealBidRO
}
