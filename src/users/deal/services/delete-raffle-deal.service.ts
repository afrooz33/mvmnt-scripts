import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'

export default async function (deal: DealEntity): Promise<any> {
  try {
    const isPurchased = await this.entityManager.findOne(UserDealItemPaymentEntity, {
      where: {
        deal: deal,
      },
      select: {
        id: true,
      },
    })

    if (isPurchased) {
      throw new PreconditionFailedException(ErrorKey.DEAL_CANNOT_DELETE)
    }

    await this.dealRepository.delete({ id: deal.id })

    return deal
  } catch (error) {
    return HandleErrors(error)
  }
}
