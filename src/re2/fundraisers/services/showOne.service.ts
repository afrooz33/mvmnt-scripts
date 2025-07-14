import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (id: string, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.fundraiserRepository)
      .addFilter('id', id)
      .addFilter('user', userId)
      .addRelation(Query.NONPROFIT)
      .addRelation(Query.NONPROFIT_PROFILE)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .addRelation(Query.DONATION_PROJECTS)
      .addRelation(`${Query.DONATION_PROJECTS}.${Query.IMAGES}`)
      .create()

    results.condition.select([
      'data.id',
      'data.title',
      'data.hex_page_color',
      'data.hex_form_color',
      'data.public_url',
      'data.goal_settings',
      'data.goal_amount',
      'data.start_date',
      'data.end_date',
      'data.donation_presets',
      'data.default_donation_preset_amount',
      'data.type',
      'data.status',
      'nonprofit.id',
      'profile.foundation_name',
      'profile_image',
      'data.description',
      'donation_projects.id',
      'donation_projects.name',
      'images',
      'data.created',
    ])

    return await results.condition.getOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
