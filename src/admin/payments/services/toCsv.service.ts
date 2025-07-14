import { ICsvAdminPayment } from '@app/src/shared/interfaces'

export default function (payment: any): ICsvAdminPayment {
  return {
    'Month/Year': payment.donation_month,
    'Pending Payments': payment.is_pending,
  }
}
