import { PreconditionFailedException } from '@nestjs/common'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { SuccessRO } from '@app/src/shared/dto'
import { DonationStatus, DonationTransferStatus } from '@app/src/donations/enums'

export default async function (month: string, year: string, status: string): Promise<SuccessRO> {
  try {
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      throw new PreconditionFailedException('Month is not valid')
    }

    if (year.length !== 4) {
      throw new PreconditionFailedException('Year is not valid')
    }

    if (!['paid', 'pending'].includes(status)) {
      throw new PreconditionFailedException('Status is not valid')
    }

    let transfer_status: DonationTransferStatus = DonationTransferStatus.PAID

    if (status === 'pending') {
      transfer_status = DonationTransferStatus.PENDING
    }

    await this.entityManager.query(`UPDATE
        donations
      SET
        transfer_status = '${transfer_status}'
      WHERE
        to_char("created", 'YYYY/mm') = '${year}/${month.toString().padStart(2, '0')}'
        AND status = '${DonationStatus.SUCCESS}'`)

    return {
      message: 'Payment status updated successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
