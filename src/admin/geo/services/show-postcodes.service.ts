import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetPostcodeDto } from '@app/src/admin/geo/dto'

export default async function (query: GetPostcodeDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.postcodeRepository)
      .create()

    if (query?.country) {
      results.condition.andWhere('"data"."countryId" = :country', { country: query.country })
    }

    results.condition.andWhere('postcode ILIKE :postcode', { postcode: `${query.postcode}%` })

    results.condition.orderBy('postcode', 'ASC')

    results.condition.select([
      'id',
      'postcode',
      'city',
      'state',
      'place',
      'latitude::float',
      'longitude::float',
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
