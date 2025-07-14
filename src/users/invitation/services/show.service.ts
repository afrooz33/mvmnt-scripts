import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function showService(query: MyPaginateDto, user: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.invitationRepository)
      .addRelation('user')
      .addFilter('invited_by', user)
      .create()

    results.condition.select(['"data"."id"', '"data"."created"'])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
