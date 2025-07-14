import { PaginateRO } from '@app/src/shared/dto'
import { QueryDto } from '@app/src/homepages/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { HomepageStatus } from '@app/src/admin/homepages/enums'

export default async function (query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('translations')
      .useQuery(this.homepageRepository)
      .addFilter('status', HomepageStatus.ENABLED)
      .create()

    results.condition.orderBy('data.display_order', 'DESC')

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
