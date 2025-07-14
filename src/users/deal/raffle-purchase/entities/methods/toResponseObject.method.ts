import { DealBidRO } from '@app/src/users/deal/bid/dto'

export default function (): DealBidRO {
  const responseObject: Partial<DealBidRO> = {
    id: this.id,
    bid_amount: this.bid_amount,
    quantity: this.quantity,
    delivery_cost: this.delivery_cost,
    total_amount: this.total_amount,
    status: this.status,
    created: this.created,
    deal: this.deal,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  return responseObject as DealBidRO
}
