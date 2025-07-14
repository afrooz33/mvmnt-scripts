import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { DeleteSettingDto } from '@app/src/re2/integrations/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { IntegrationSettingType, IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (
  userId: string,
  payload: DeleteSettingDto,
  integrationId: string,
  shopifyIntegrationId: string,
): Promise<SuccessRO> {
  try {
    let repository

    switch (payload.type) {
      case IntegrationSettingType.CART_BANNER:
        repository = this.shopifyCartBannerSettingRepository
        break
      case IntegrationSettingType.CART_DRAWER:
        repository = this.shopifyCartDrawerSettingRepository
        break
      case IntegrationSettingType.SALE_PORTION:
        repository = this.shopifySalePortionSettingRepository
        break
      default:
        throw new Error('Invalid type')
    }

    const setting = await repository.findOne({
      where: {
        id: payload.id,
        status: Not(IntegrationStatus.DELETED),
        shopify_integration: {
          id: shopifyIntegrationId,
          integration: {
            id: integrationId,
            user: {
              id: userId,
            },
            status: Not(IntegrationStatus.DELETED),
          },
        },
      },
      select: ['id'],
    })

    if (!setting) {
      throw new PreconditionFailedException(ErrorKey.RE2_INTEGRATION_SETTING_NOT_FOUND)
    }

    await repository.update({ id: payload.id }, { status: IntegrationStatus.DELETED })

    return {
      success: true,
      message: 'Setting successfully deleted',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
