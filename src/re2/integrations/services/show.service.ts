import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { MySearchDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (query: MySearchDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.integrationsRepository)
      .addFilter('user', userId)
      .addRelation(Query.SHOPIFY)
      .create()

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
