import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateSalePortionDto } from '@app/src/re2/integrations/dto'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (
  integrationId: string,
  shopifyIntegrationId: string,
  userId: string,
  payload: UpdateSalePortionDto,
): Promise<SuccessRO> {
  try {
    const salePortion = await this.shopifySalePortionSettingRepository.findOne({
      where: {
        id: payload.id,
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

    if (!salePortion) {
      throw new PreconditionFailedException(
        JSON.stringify({
          key: ErrorKey.RE2_SALE_PORTION_SETTINGS_NOT_FOUND,
          args: { id: payload.id },
        }),
      )
    }

    await this.createSalePortion(integrationId, shopifyIntegrationId, userId, payload)

    return {
      success: true,
      message: 'Sale portion settings updated successfully.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
