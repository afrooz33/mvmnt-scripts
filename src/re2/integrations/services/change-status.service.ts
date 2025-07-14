import { Not } from 'typeorm'
import { BadRequestException, PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ChangeStatusDto } from '@app/src/re2/integrations/dto'
import {
  IntegrationStatus,
  IntegrationSettingType,
  IntegrationPayloadStatus,
} from '@app/src/re2/integrations/enums'

export default async function changeStatus(
  id: string,
  integrationId: string,
  shopifyIntegrationId: string,
  userId: string,
  payload: ChangeStatusDto,
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

    const enabledSetting = await repository.findOne({
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
      select: ['id', 'status'],
    })

    if (
      payload.status === IntegrationPayloadStatus.ENABLED &&
      payload.type === IntegrationSettingType.SALE_PORTION
    ) {
      const currentSetting = await this.shopifySalePortionSettingRepository.findOne({
        where: {
          id,
        },
      })

      const shopifyProducts = currentSetting.shopify_products
      const shopifyVariants = currentSetting.shopify_variants
      const shopifyCollections = currentSetting.shopify_collections

      if (
        (shopifyProducts && !shopifyProducts.length) ||
        (shopifyCollections && !shopifyCollections.length) ||
        (shopifyVariants && !shopifyVariants.length)
      ) {
        throw new PreconditionFailedException(ErrorKey.CAN_NOT_ENABLE_SALE_PORTION_SETTING)
      }

      let allowEnable = true

      if (shopifyProducts && shopifyProducts.length) {
        await Promise.all(
          shopifyProducts.map(async (product) => {
            const found = await this.isShopifyIdInUse(id, product, 'products')

            if (found) {
              allowEnable = false
            }
          }),
        )
      }

      if (shopifyCollections && shopifyCollections.length) {
        await Promise.all(
          shopifyCollections.map(async (collection) => {
            const found = await this.isShopifyIdInUse(id, collection, 'collections')

            if (found) {
              allowEnable = false
            }
          }),
        )
      }

      if (shopifyVariants && shopifyVariants.length) {
        await Promise.all(
          shopifyVariants.map(async (variant) => {
            const found = await this.isShopifyIdInUse(id, variant, 'variants')

            if (found) {
              allowEnable = false
            }
          }),
        )
      }

      if (!allowEnable) {
        throw new BadRequestException(ErrorKey.RE2_SALE_PORTION_SETTINGS_EXISTS)
      }
    }

    if (enabledSetting && payload.status === IntegrationPayloadStatus.ENABLED) {
      enabledSetting.status = IntegrationPayloadStatus.DISABLED

      await repository.save(enabledSetting)
    }

    await repository.update(
      {
        id,
      },
      {
        status: payload.status,
      },
    )

    return {
      message: 'Integration setting status updated successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
