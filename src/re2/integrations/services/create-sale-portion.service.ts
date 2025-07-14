import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateSalePortionDto } from '@app/src/re2/integrations/dto'
import { NonprofitAccountStatus } from '@app/src/admin/nonprofit/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { IntegrationDonationType, IntegrationPayloadStatus } from '@app/src/re2/integrations/enums'

export default async function (
  integrationId: string,
  shopifyIntegrationId: string,
  userId: string,
  payload: CreateSalePortionDto,
): Promise<SuccessRO> {
  try {
    if (
      payload.donation_type === IntegrationDonationType.FIXED_AMOUNT_PER_PRODUCT ||
      payload.donation_type === IntegrationDonationType.PERCENTAGE_OF_PRODUCT ||
      payload.donation_type === IntegrationDonationType.ROUND_UP_PER_PRODUCT
    ) {
      await this.validateShopifyPayload(payload)
    } else if (
      (payload.shopify_products && payload.shopify_products.length) ||
      (payload.shopify_collections && payload.shopify_collections.length) ||
      (payload.shopify_variants && payload.shopify_variants.length)
    ) {
      throw new PreconditionFailedException(
        'shopify_products, shopify_collections, shopify_variants should not be set for this donation type',
      )
    }

    if (
      (payload.donation_project && payload.nonprofit) ||
      (!payload.donation_project && !payload.nonprofit)
    ) {
      throw new PreconditionFailedException(
        ErrorKey.BOTH_DONATION_NONPROFIT_AND_PROJECT_NOT_ALLOWED,
      )
    }

    const { user, shopify_integration } = await this.validateUserAndIntegration(
      integrationId,
      shopifyIntegrationId,
      userId,
    )

    if (payload.nonprofit) {
      payload.nonprofit = await this.nonprofitUserService.documentExists({
        condition: [
          {
            where: {
              id: payload.nonprofit,
              account_status: NonprofitAccountStatus.ACTIVE,
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.NONPROFIT_PROFILE_NOT_FOUND,
      })
    }

    if (payload.donation_project) {
      payload.donation_project = await this.donationProjectsService.documentExists({
        condition: [
          {
            where: {
              id: payload.donation_project,
              status: In([DonationProjectStatus.ENDED, DonationProjectStatus.PUBLISHED]),
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
      })
    }

    const setting = await this.shopifySalePortionSettingRepository.save({
      ...payload,
      user,
      shopify_integration,
    })

    if (payload.status === IntegrationPayloadStatus.ENABLED) {
      const enabledSetting = await this.shopifySalePortionSettingRepository.findOne({
        where: {
          id: Not(setting.id),
          shopify_integration: {
            id: shopify_integration.id,
          },
          status: IntegrationPayloadStatus.ENABLED,
        },
        select: ['id', 'status'],
      })

      if (enabledSetting && payload.status === IntegrationPayloadStatus.ENABLED) {
        enabledSetting.status = IntegrationPayloadStatus.DISABLED

        await this.shopifySalePortionSettingRepository.save(enabledSetting)
      }
    }

    return {
      success: true,
      message: 'Integration sales portion settings created successfully.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
