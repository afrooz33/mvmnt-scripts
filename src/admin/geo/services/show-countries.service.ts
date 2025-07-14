import { PaginateRO } from '@app/src/shared/dto'
import { GetCountryDto } from '@app/src/admin/geo/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (query: GetCountryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.countryRepository)
      .create()

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
