import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { IntegrationSettingType, IntegrationStatus } from '@app/src/re2/integrations/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (type: IntegrationSettingType, shop: string): Promise<SuccessRO> {
  try {
    shop = shop.replace('.myshopify.com', '')

    await this.documentExists({
      condition: [
        {
          where: {
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

    let repository
    const fields = [
      'data.id',
      'data.name',
      'data.created',
      'nonprofits.id',
      'profile.first_name',
      'profile.last_name',
      'profile.foundation_name',
      'profile.foundation_url',
      'donation_projects.id',
      'donation_projects.name',
    ]

    switch (type) {
      case IntegrationSettingType.CART_BANNER:
        repository = this.shopifyCartBannerSettingRepository
        fields.push(
          'data.round_up_total_value',
          'data.round_up_total_status',
          'data.add_single_item_status',
        )
        break
      case IntegrationSettingType.CART_DRAWER:
        repository = this.shopifyCartDrawerSettingRepository
        break
      case IntegrationSettingType.SALE_PORTION:
        fields.push('data.donation_type', 'data.donation_value')
        repository = this.shopifySalePortionSettingRepository
        break
      default:
        throw new Error('Invalid type')
    }

    const settings: QueryBuilderDataInterface = new QueryBuilder({
      filter: {
        status: IntegrationStatus.ENABLED,
      },
    })
      .addRelation(Query.NONPROFITS)
      .addRelation(`${Query.NONPROFITS}.${Query.PROFILE}`)
      .addRelation(Query.DONATION_PROJECTS)
      .addRelation(Query.SHOPIFY_INTEGRATION)
      .addRelation(Query.SHOPIFY_INTEGRATION_INTEGRATION)
      .useQuery(repository)
      .create()

    settings.condition.select(fields)

    settings.pagination.limit = 1

    const setting = await this.customPaginate(settings)

    return {
      data: setting,
      message: '',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
