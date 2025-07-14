import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { Query } from '@app/src/shared/enums'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { HaveChild } from '@app/src/admin/deals/category/enums'
import { QueryDto } from '@app/src/admin/guides/dto'

export default async function (query: QueryDto) {
  try {
    let checkIfChildren = false

    if (query.filter.have_child && query.filter.have_child === HaveChild.YES) {
      checkIfChildren = true
    }

    delete query.filter.have_child

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.guidesRepository)
      .create()

    if (checkIfChildren) {
      results.condition.andWhere(`${Query.CHILDREN} IS NOT NULL`)
    }

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
