import { In, MoreThan } from 'typeorm'
import { UnprocessableEntityException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'

export default async function (cart): Promise<SuccessRO> {
  try {
    const variant = await this.dealVariantRepository.findOne({
      where: {
        id: cart.variant.id,
        deal: {
          id: cart.deal.id,
          status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
        },
        quantity: MoreThan(0),
      },
    })

    if (!variant) {
      throw new UnprocessableEntityException('Variant not available')
    }

    const quantity: number = variant.quantity - cart.quantity
    const remainingQuantity = quantity < 0 ? 0 : quantity

    await this.dealVariantRepository.update(cart.variant.id, {
      remaining_quantity: remainingQuantity,
    })

    return {
      success: true,
      message: 'Quantity updated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
