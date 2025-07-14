import { DateTime } from 'luxon'
import { BadRequestException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { StarEarningHistoryDto } from '@app/src/users/rankings/dto'

export default async function (query: StarEarningHistoryDto, userId: string): Promise<PaginateRO> {
  try {
    const currentYear = DateTime.now().year
    const year = query.year ? Number(query.year) : currentYear

    let month: string | undefined

    if (query.month) {
      month = query.month.padStart(2, '0')

      const parsedDate = DateTime.fromObject({ year, month: Number(month) })

      if (!parsedDate.isValid) {
        throw new BadRequestException('Invalid month and year combination')
      }

      if (parsedDate > DateTime.now()) {
        throw new BadRequestException('Year and month combination cannot be in the future')
      }
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.starsService.userStarsRepository)
      .addFilter('user', userId)
      .addFilter('type', query.type)
      .create()

    if (month && year) {
      results.condition.andWhere(
        'EXTRACT(YEAR FROM "data"."created") = :year AND EXTRACT(MONTH FROM "data"."created") = :month',
        { year, month },
      )
    } else if (month) {
      results.condition.andWhere('EXTRACT(MONTH FROM "data"."created") = :month', { month })
    } else if (query.year) {
      results.condition.andWhere('EXTRACT(YEAR FROM "data"."created") = :year', { year })
    }

    const paginatedData = await this.starsService.paginate(results)

    // Separate query to get total stars earned by the user
    const totalStarsResult = await this.starsService.userStarsRepository
      .createQueryBuilder('user_stars')
      .select('COALESCE(SUM("user_stars"."stars"), 0)', 'total_stars')
      .where('"user_stars"."userId" = :userId', { userId })
      .andWhere(query.type ? '"user_stars"."type" = :type' : '1=1', { type: query.type })
      .andWhere(month ? 'EXTRACT(MONTH FROM "user_stars"."created") = :month' : '1=1', { month })
      .andWhere(year ? 'EXTRACT(YEAR FROM "user_stars"."created") = :year' : '1=1', { year })
      .getRawOne()

    const totalStars = Number(totalStarsResult.total_stars)

    return {
      ...paginatedData,
      total_stars: totalStars,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
