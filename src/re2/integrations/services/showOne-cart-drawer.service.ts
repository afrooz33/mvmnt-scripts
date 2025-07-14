import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (id: string, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .addRelation(Query.NONPROFITS)
      .addRelation(`${Query.NONPROFITS}.${Query.PROFILE}`)
      .addRelation(`${Query.PROFILE}.${Query.PROFILE_IMAGE}`)
      .addRelation(Query.DONATION_PROJECTS)
      .addRelation(`${Query.DONATION_PROJECTS}.${Query.IMAGES}`)
      .addRelation(Query.SHOPIFY_INTEGRATION)
      .addRelation(Query.SHOPIFY_INTEGRATION_INTEGRATION)
      .useQuery(this.shopifyCartDrawerSettingRepository)
      .addFilter('id', id)
      .addFilter('status', IntegrationStatus.DELETED, true)
      .create()

    results.condition.select([
      'data.id',
      'data.name',
      'data.status',
      'data.created',
      'nonprofits.id',
      'profile_image',
      'images',
      'profile.first_name',
      'profile.last_name',
      'profile.foundation_name',
      'profile.foundation_url',
      'donation_projects.id',
      'donation_projects.name',
    ])

    results.condition.andWhere('"integration"."userId" = :userId', { userId })

    return await results.condition.getOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
