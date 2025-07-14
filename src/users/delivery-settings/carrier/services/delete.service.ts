import { Not } from 'typeorm'
import { NotFoundException, PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
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

    const deliverySetting = await this.deliverySettingsRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        type: DeliverySettingsType.GENERAL,
        general_settings: {
          carrier: {
            id,
          },
        },
      },
      select: ['id'],
    })

    if (deliverySetting) {
      throw new PreconditionFailedException(ErrorKey.DEFAULT_CARRIER_CANT_BE_DELETED)
    }

    const carrier = await this.deliveryCarrierRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
        status: Not(DeliverySettingStatus.DELETED),
      },
      select: ['id'],
    })

    if (!carrier) {
      throw new NotFoundException(ErrorKey.DELIVERY_CARRIER_NOT_FOUND)
    }

    await this.deliveryCarrierRepository.update({ id }, { status: DeliverySettingStatus.DELETED })

    return {
      success: true,
      message: 'Delivery carrier deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
