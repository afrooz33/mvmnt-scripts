import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateDto } from '@app/src/re2/integrations/dto'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (payload: CreateDto, userId: string): Promise<SuccessRO> {
  try {
    const integration = await this.updateOne({
      type: payload.type,
      status: IntegrationStatus.ENABLED,
      user: { id: userId },
      shopify: {
        shop: payload.shop,
      },
    })

    return {
      success: true,
      message: 'Integration created successfully',
      data: integration,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
