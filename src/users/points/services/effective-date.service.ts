import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { POINTS_STATUS } from '@app/src/users/points/enums'

export default async function (query: MyPaginateDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userPointsRepository)
      .addFilter('user', userId)
      .create()

    results.condition.andWhere('"data"."status" IN (:...point_status)', {
      point_status: [
        POINTS_STATUS.UNLOCKED,
        POINTS_STATUS.DELIVERED,
        POINTS_STATUS.PARTIALLY_REDEEMED,
      ],
    })

    results.condition.select([
      "TO_CHAR(data.expiry_date, 'YYYY-MM-DD') as expiry",
      'SUM(data.amount) as points',
      'SUM(data.remaining) as remaining',
    ])

    results.condition.groupBy("TO_CHAR(data.expiry_date, 'YYYY-MM-DD')")
    results.condition.orderBy("TO_CHAR(data.expiry_date, 'YYYY-MM-DD')", 'ASC')

    const result = await this.rawPaginate(results)

    const totalPoints = await this.userPointsRepository
      .createQueryBuilder('user_points')
      .where('user_points.user = :userId', { userId })
      .andWhere('user_points.status IN (:...point_status)', {
        point_status: [
          POINTS_STATUS.UNLOCKED,
          POINTS_STATUS.DELIVERED,
          POINTS_STATUS.PARTIALLY_REDEEMED,
        ],
      })
      .select('COALESCE(SUM(remaining), 0) points')
      .getRawOne()

    return {
      ...result,
      total_points: totalPoints.points,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
