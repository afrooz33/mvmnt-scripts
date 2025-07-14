import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import {
  IntegrationStatus,
  IntegrationSettingType,
  IntegrationPayloadStatus,
} from '@app/src/re2/integrations/enums'

export default async function perChangeStatus(
  id: string,
  integrationId: string,
  shopifyIntegrationId: string,
  userId: string,
  type: IntegrationSettingType,
): Promise<SuccessRO> {
  try {
    let repository

    switch (type) {
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
      select: ['id'],
    })

    if (!setting) {
      throw new PreconditionFailedException(
        JSON.stringify({
          key: ErrorKey.RE2_INTEGRATION_SETTING_NOT_FOUND,
          args: { id },
        }),
      )
    }

    const existingSetting = await repository.findOne({
      where: {
        id: Not(id),
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
        status: IntegrationPayloadStatus.ENABLED,
      },
      select: ['id'],
    })

    return {
      success: true,
      message: 'Integration setting status checked successfully',
      data: existingSetting,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
