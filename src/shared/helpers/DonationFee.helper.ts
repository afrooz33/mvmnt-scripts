import { SystemFeeEntity } from '@app/src/admin/system-fee/entities/system-fee.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default function getDonationFee(
  donationType: DonationProjectStatus,
  systemFee: SystemFeeEntity,
): number {
  // ToDo: Add more inputs to handle fundraisers
  switch (donationType) {
    case DonationProjectStatus.DEFAULT:
      return systemFee.nonprofit_donation_fee
    default:
      return systemFee.donation_project_donation_fee
  }
}
