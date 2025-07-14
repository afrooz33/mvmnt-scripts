import axios from 'axios'
import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AppProductDto } from '@app/src/re2/integrations/dto'
import { GenerateRe2DashboardToken } from '@app/src/re2/integrations/helpers'
import { IntegrationStatus, ShopifyResource } from '@app/src/re2/integrations/enums'

export default async function (
  query: AppProductDto,
  userId: string,
  shop: string,
  resource: ShopifyResource,
): Promise<SuccessRO> {
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
        args: { shop: shop },
      }),
    })

    const queryString = Object.keys(query)
      .map((key) => key + '=' + query[key])
      .join('&')

    const { data } = await axios({
      url: `${process.env.SHOPIFY_APP_URL}/api/re2/${resource}?shop=${shop}.myshopify.com&${queryString}`,
      method: 'GET',
      headers: {
        'x-re2-dashboard-token': await GenerateRe2DashboardToken(),
      },
    })

    return {
      success: true,
      message: 'Shopify',
      data,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
