import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ResellingRewardMemoType } from '@app/src/users/reselling/enums'

export default async function (
  id: string,
  query: MyPaginateDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.resellingRewardMemoRepository)
      .addRelation(Query.REWARD)
      .addRelation(`${Query.REWARD}.${Query.CART}`)
      .create()

    results.condition.andWhere(`"reward"."id" = :id`, { id })

    results.condition
      .andWhere('"cart"."sellerId" = :userId', { userId })
      .orderBy('CASE WHEN "data"."type" = :generalType THEN 0 ELSE 1 END', 'ASC')
      .addOrderBy('"data"."created"', 'DESC')
      .setParameter('generalType', ResellingRewardMemoType.GENERAL)

    results.condition.select(['data.id', 'data.type', 'data.memo', 'data.created'])

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
