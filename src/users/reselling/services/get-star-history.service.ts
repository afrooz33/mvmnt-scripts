import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryRewardHistoryDto } from '@app/src/users/reselling/dto'
import { StarType } from '@app/src/users/stars/enums/star-type.enum'

export default async function (
  query: QueryRewardHistoryDto,
  userId: string,
  type: StarType,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.resellingRewardRepository)
      .addFilter('user', userId)
      .addFilter('status', query.status)
      .addRelation(Query.DEAL)
      .addRelation(Query.CART_ITEM)
      .addRelation(Query.STARS)
      .addFilter('stars.type', type)
      .create()

    results.condition.andWhere('"data"."starsId" IS NOT NULL')

    if (query?.year) {
      results.condition.andWhere('EXTRACT(YEAR FROM "data"."acquisition_date") = :year', {
        year: query.year,
      })
    }

    if (query?.year && query?.month) {
      results.condition.andWhere(
        'EXTRACT(YEAR FROM "data"."acquisition_date") = :year AND EXTRACT(MONTH FROM "data"."acquisition_date") = :month',
        { year: query.year, month: query.month },
      )
    } else if (query?.year) {
      results.condition.andWhere('EXTRACT(YEAR FROM "data"."acquisition_date") = :year', {
        year: query.year,
      })
    } else if (query?.month) {
      results.condition.andWhere('EXTRACT(MONTH FROM "data"."acquisition_date") = :month', {
        month: query.month,
      })
    }

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
