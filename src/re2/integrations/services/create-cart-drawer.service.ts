import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateCartDrawerDto } from '@app/src/re2/integrations/dto'
import { IntegrationPayloadStatus } from '@app/src/re2/integrations/enums'

export default async function (
  integrationId: string,
  shopifyIntegrationId: string,
  userId: string,
  payload: CreateCartDrawerDto,
): Promise<SuccessRO> {
  try {
    const { user, shopify_integration } = await this.validateUserAndIntegration(
      integrationId,
      shopifyIntegrationId,
      userId,
    )

    payload.nonprofits = await this.validateNonprofits(payload)
    payload.donation_projects = await this.validateDonationProjects(payload)

    const setting = await this.shopifyCartDrawerSettingRepository.save({
      ...payload,
      user,
      shopify_integration,
    })

    if (payload.status === IntegrationPayloadStatus.ENABLED) {
      const enabledSetting = await this.shopifyCartDrawerSettingRepository.findOne({
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

        await this.shopifyCartDrawerSettingRepository.save(enabledSetting)
      }
    }

    return {
      success: true,
      message: 'Cart drawer created successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
