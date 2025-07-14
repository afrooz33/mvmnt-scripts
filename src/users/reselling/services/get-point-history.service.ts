import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryRewardHistoryDto } from '@app/src/users/reselling/dto'

export default async function (query: QueryRewardHistoryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.resellingRewardRepository)
      .addFilter('user', userId)
      .addFilter('status', query.status)
      .addRelation(Query.DEAL)
      .addRelation(Query.CART_ITEM)
      .addRelation(Query.POINTS)
      .create()

    results.condition.andWhere('"data"."pointsId" IS NOT NULL')

    if (query.year && query.month) {
      results.condition.andWhere(
        'EXTRACT(YEAR FROM "points"."delivery_date") = :year AND EXTRACT(MONTH FROM "points"."delivery_date") = :month',
        { year: query.year, month: query.month },
      )
    } else if (query.year) {
      results.condition.andWhere('EXTRACT(YEAR FROM "points"."delivery_date") = :year', {
        year: query.year,
      })
    } else if (query.month) {
      results.condition.andWhere('EXTRACT(MONTH FROM "points"."delivery_date") = :month', {
        month: query.month,
      })
    }

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
