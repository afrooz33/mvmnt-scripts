import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/tags/dto'

export default async function showService(query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.tagRepository)
      .create()

    if (query?.has_nonprofit) {
      results.condition.andWhere(
        `"data"."id" IN (SELECT "tagsId" FROM "nonprofit_profiles_tags_tags")`,
      )
    }

    if (query?.has_donation_project) {
      results.condition.andWhere(
        `"data"."id" IN (SELECT "tagsId" FROM "donation_projects_tags_tags")`,
      )
    }

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
