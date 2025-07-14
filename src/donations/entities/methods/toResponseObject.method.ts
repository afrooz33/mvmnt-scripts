import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'

export default function (): UserDonationsEntity {
  const responseObject: any = {
    id: this.id,
    amount: this.amount,
    reason: this.reason,
    net_amount: this.net_amount,
    current_bid: this.current_bid,
    participants: this.participants,
    transfer_date: this.transfer_date,
    donation_type: this.donation_type,
    total_donation: this.total_donation,
    donation_method: this.donation_method,
    transfer_status: this.transfer_status,
    integration_mode: this.integration_mode,
    total_raffle_sales: this.total_raffle_sales,
    donation_frequency: this.donation_frequency,
    total_buynow_sales: this.total_buynow_sales,
    remaining_quantity: this.remaining_quantity,
    donation_start_date: this.donation_start_date,
    status: this.status,
    updated: this.updated,
    created: this.created,
  }

  if (this.user) {
    responseObject.user = this.user.toResponseObject()
  }

  if (this.user_deal_item_payment) {
    responseObject.user_deal_item_payment = this.user_deal_item_payment.toResponseObject()
  }

  if (this.user_donation_payment) {
    responseObject.user_donation_payment = this.user_donation_payment.toResponseObject()
  }

  if (this.payment_currency) {
    responseObject.payment_currency = this.payment_currency.toResponseObject()
  }

  return responseObject
}
