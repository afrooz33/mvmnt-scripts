import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (id: string, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .addRelation(Query.NONPROFIT)
      .addRelation(`${Query.NONPROFIT}.${Query.PROFILE}`)
      .addRelation(`${Query.PROFILE}.${Query.PROFILE_IMAGE}`)
      .addRelation(Query.DONATION_PROJECT)
      .addRelation(`${Query.DONATION_PROJECT}.${Query.IMAGES}`)
      .addRelation(Query.SHOPIFY_INTEGRATION)
      .addRelation(Query.SHOPIFY_INTEGRATION_INTEGRATION)
      .useQuery(this.shopifySalePortionSettingRepository)
      .addFilter('id', id)
      .addFilter('status', IntegrationStatus.DELETED, true)
      .create()

    results.condition.select([
      'data.id',
      'data.name',
      'data.donation_type',
      'data.donation_value',
      'data.shopify_products',
      'data.shopify_collections',
      'data.shopify_variants',
      'data.status',
      'data.created',
      'nonprofit.id',
      'profile_image',
      'images',
      'profile.first_name',
      'profile.last_name',
      'profile.foundation_name',
      'profile.foundation_url',
      'donation_project.id',
      'donation_project.name',
      'shopify_integration',
    ])

    results.condition.andWhere('"integration"."userId" = :userId', { userId })

    const sales_portion = await results.condition.getOne()

    if (sales_portion?.shopify_products) {
      const shopify_products = await this.filterResource(
        {
          id: sales_portion.shopify_products,
        },
        userId,
        sales_portion.shopify_integration.shop,
        'products',
      )

      if (shopify_products.success) {
        sales_portion.shopify_products = shopify_products.data.product
      }
    }

    if (sales_portion?.shopify_collections) {
      const shopify_collections = await this.filterResource(
        {
          id: sales_portion.shopify_collections,
        },
        userId,
        sales_portion.shopify_integration.shop,
        'collections',
      )

      if (shopify_collections.success) {
        sales_portion.shopify_collections = shopify_collections.data.collection
      }
    }

    if (sales_portion?.shopify_variants) {
      const shopify_variants = await this.filterResource(
        {
          id: sales_portion.shopify_variants,
          limit: 10,
        },
        userId,
        sales_portion.shopify_integration.shop,
        'variants',
      )

      if (shopify_variants.success) {
        sales_portion.shopify_variants = shopify_variants.data.variants
      }
    }

    return {
      ...sales_portion,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
