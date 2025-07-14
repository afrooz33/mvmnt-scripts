import axios from 'axios'
import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { GenerateRe2DashboardToken } from '@app/src/re2/integrations/helpers'

export default async function (shop: string, userId: string): Promise<SuccessRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            user: {
              id: userId,
            },
            shopify: {
              shop,
            },
            status: Not(IntegrationStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_INTEGRATION_NOT_FOUND,
        args: { id: shop },
      }),
    })

    const { data } = await axios({
      url: `${process.env.SHOPIFY_APP_URL}/api/re2/installed?shop=${shop}.myshopify.com`,
      method: 'GET',
      headers: {
        'x-re2-dashboard-token': await GenerateRe2DashboardToken(),
      },
    })

    data['installation_url'] =
      `${process.env.SHOPIFY_APP_URL}/auth/install?shop=${shop}.myshopify.com`

    return {
      success: true,
      message: 'Shopify',
      data,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
