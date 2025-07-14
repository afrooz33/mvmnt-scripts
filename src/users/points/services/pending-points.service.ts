import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { POINTS_STATUS } from '@app/src/users/points/enums'

export default async function (query: MyPaginateDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userPointUpdatesRepository)
      .addRelation('user_point')
      .create()

    results.condition.andWhere('"user_point"."userId" = :userId', { userId })
    results.condition.andWhere('"user_point"."status" = :status', { status: POINTS_STATUS.LOCKED })

    const result = await this.paginate(results)

    const totalPoints = await this.userPointsRepository
      .createQueryBuilder('user_points')
      .where('user_points.user = :userId', { userId })
      .andWhere('user_points.status IN (:...point_status)', {
        point_status: [POINTS_STATUS.LOCKED],
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
