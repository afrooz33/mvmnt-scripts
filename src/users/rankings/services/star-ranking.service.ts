import { DateTime } from 'luxon'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus, UserAccountType } from '@app/src/users/user/enums'
import { StarRankingQueryDto } from '@app/src/users/rankings/dto'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { Query } from '@app/src/shared/enums'

export default async function (query: StarRankingQueryDto, userId?: string): Promise<any> {
  try {
    const { type, year, month } = query

    const currentYear = DateTime.now().year
    const dateConditions = []
    const dateParams: any = {}

    if (month && year) {
      dateConditions.push(
        `EXTRACT(YEAR FROM "data"."created") = :year AND EXTRACT(MONTH FROM "data"."created") = :month`,
      )
      dateParams.year = year
      dateParams.month = month
    } else if (month) {
      dateConditions.push(
        `EXTRACT(MONTH FROM "data"."created") = :month AND EXTRACT(YEAR FROM "data"."created") = :year`,
      )
      dateParams.month = month
      dateParams.year = currentYear
    } else if (year) {
      dateConditions.push(`EXTRACT(YEAR FROM "data"."created") = :year`)
      dateParams.year = year
    }

    let userAccountType = [
      UserAccountType.INDIVIDUAL_INFLUENCER,
      UserAccountType.INDIVIDUAL_PERSONAL,
    ]

    if (query?.user_type === 'BUSINESS') {
      userAccountType = [UserAccountType.BUSINESS_COMPANY, UserAccountType.BUSINESS_SOLE_PROPRIETOR]
    }

    let dateConditionString = dateConditions.length > 0 ? dateConditions.join(' AND ') : '1=1'

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.starsService.userStarsRepository)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere('"user"."account_status" = :account_status', {
      account_status: AccountStatus.ENABLED,
    })

    results.condition.andWhere('"user"."account_type" IN (:...userAccountType)', {
      userAccountType,
    })

    results.condition.select([
      'user.id userId',
      `COALESCE(SUM("data"."stars"), 0) as total_stars`,
      'user.username username',
      'user.display_name display_name',
      'profile_images.url as profile_image',
      'profile.social_accounts as social_accounts',
    ])

    results.condition.andWhere(dateConditionString, dateParams)
    results.condition.andWhere(type ? '"data"."type" = :type' : '1=1', { type })
    results.condition.groupBy('"data"."userId", "user"."id", "profile"."id", "profile_images".id')
    results.condition.orderBy('COALESCE(SUM("data"."stars"), 0)', 'DESC')

    let userRanking = null
    let userTotalStars = null

    if (userId) {
      dateConditionString = dateConditionString.replace(/"data"/g, '"user_stars"')

      userTotalStars = await this.starsService.userStarsRepository
        .createQueryBuilder('user_stars')
        .select('COALESCE(SUM("user_stars"."stars"), 0)', 'total_stars')
        .where('"user_stars"."userId" = :userId', { userId })
        .andWhere(type ? '"user_stars"."type" = :type' : '1=1', { type })
        .andWhere(dateConditions.length > 0 ? dateConditionString : '1=1', dateParams)
        .getRawOne()

      if (userTotalStars && userTotalStars.total_stars) {
        const rankQuery = this.starsService.userStarsRepository
          .createQueryBuilder('user_stars')
          .select('COUNT(DISTINCT "subQuery"."userId") + 1', 'rank')
          .from((subQuery) => {
            return subQuery
              .select('"user_stars"."userId"', 'userId')
              .addSelect('COALESCE(SUM("user_stars"."stars"), 0)', 'totalStars')
              .from('user_stars', 'user_stars')
              .where(type ? '"user_stars".type = :type' : '1=1', { type })
              .andWhere(dateConditions.length > 0 ? dateConditionString : '1=1', dateParams)
              .groupBy('"user_stars"."userId"')
          }, 'subQuery')
          .where('"subQuery"."totalStars" > :userTotalStars', {
            userTotalStars: userTotalStars.total_stars,
          })

        userRanking = await rankQuery.getRawOne()
      }
    }

    const result = await this.starsService.rawPaginate(results)

    return {
      ...result,
      userRanking: userRanking
        ? {
            rank: userRanking.rank,
            totalStars: userTotalStars.total_stars,
          }
        : null,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
