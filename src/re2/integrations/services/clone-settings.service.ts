import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CloneSettingDto } from '@app/src/re2/integrations/dto'
import { IntegrationStatus, IntegrationSettingType } from '@app/src/re2/integrations/enums'

export default async function cloneService(
  id: string,
  integrationId: string,
  shopifyIntegrationId: string,
  userId: string,
  payload: CloneSettingDto,
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
        id,
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
    })

    if (!setting) {
      throw new PreconditionFailedException(
        JSON.stringify({
          key: ErrorKey.RE2_INTEGRATION_SETTING_NOT_FOUND,
          args: { id },
        }),
      )
    }

    const clonedSetting = await repository.save({
      ...setting,
    })

    return {
      message: 'Settings cloned successfully',
      success: true,
      data: clonedSetting,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
