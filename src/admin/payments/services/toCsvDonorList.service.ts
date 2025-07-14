import { ICsvNonprofitPaymentDonor } from '@app/src/shared/interfaces'

export default function (payment: any): ICsvNonprofitPaymentDonor {
  return {
    'Donor id': payment.donor_id,
    'Donor username': payment.donor_username,
    'Donor display name': payment.donor_display_name,
    'Donation amount': payment.amount,
    'Donation frequency': payment.donation_frequency,
    'Donation date': payment.created,
    'Donation method': payment.donation_method,
    'Payment currency id': payment.payment_currency_id,
    'Payment currency': payment.payment_currency_name,
    'Foundation name': payment.foundation_name,
    'Donation project name': payment.donation_project_name,
    'Deal name': payment.deal_name,
  }
}
