import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { Query } from '@app/src/shared/enums'

export default async function (query: MyPaginateDto, countryId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.provinceRepository)
      .addRelation(Query.TRANSLATIONS)
      .addRelation(Query.TRANSLATIONS_LANGUAGE)
      .addFilter('country', countryId)
      .create()

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
