import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DeliverySettingStatus } from '@app/src/users/delivery-settings/enums'
import { CreateDeliveryCarrierDto } from '@app/src/users/delivery-settings/carrier/dto'

export default async function (
  payload: CreateDeliveryCarrierDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const exists = await this.deliveryCarrierRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        status: Not(DeliverySettingStatus.DELETED),
        name: payload.name,
      },
      select: ['id'],
    })

    if (exists) {
      throw new PreconditionFailedException(ErrorKey.DELIVERY_CARRIER_NAME_ALREADY_EXISTS)
    }

    await this.updateOne({
      ...payload,
      user,
    })

    return {
      success: true,
      message: 'Delivery carrier successfully created',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
