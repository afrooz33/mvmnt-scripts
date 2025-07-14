import { In, Not } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { ReportDto } from '@app/src/users/deal/report/dto'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default async function createService(
  payload: ReportDto,
  userId: string,
  dealId: string,
): Promise<SuccessRO> {
  try {
    const deal: DealEntity = await this.dealRepository.findOne({
      where: {
        id: dealId,
        status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
        user: Not(userId),
      },
      select: ['id', 'deal_type', 'status'],
    })

    if (!deal) {
      throw new NotFoundException(ErrorKey.DEAL_NOT_FOUND)
    }

    await this.entityManager.findOneOrFail('user_deal_payment', {
      where: {
        status: In([PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED]),
        user: {
          id: userId,
        },
        deal: {
          id: dealId,
        },
      },
      select: ['id'],
    })

    const report = await this.updateOne({
      ...payload,
      user: { id: userId },
      deal: { id: dealId },
    })

    return {
      message: 'Report has been submitted successfully',
      success: true,
      data: report,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
