import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/admin/tokens/dto'

export default async function showService(query: QueryDto): Promise<PaginateRO> {
  try {
    const result: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.tokenWhitelistRepository)
      .create()

    if (query?.is_whitelisted) {
      result.condition.andWhere('"data"."is_whitelisted" = :is_whitelisted', {
        is_whitelisted: query.is_whitelisted === 'Yes',
      })
    }

    return await this.paginate(result)
  } catch (error) {
    return HandleErrors(error)
  }
}
