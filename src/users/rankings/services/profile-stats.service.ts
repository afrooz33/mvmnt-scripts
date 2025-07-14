import { DateTime } from 'luxon'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { StarType } from '@app/src/users/stars/enums'

export default async function (userId: string): Promise<any> {
  try {
    const currentYear = DateTime.now().year
    const currentMonth = DateTime.now().month

    const starTypesToFetch: StarType[] = [
      StarType.TRANSACTION,
      StarType.DONATION,
      StarType.CONTRIBUTION,
    ]

    const profileStats: any = {}

    for (const starType of starTypesToFetch) {
      // Get current month stats
      const currentUserTotalStarsResult = await this.starsService.userStarsRepository
        .createQueryBuilder('user_stars_current_month')
        .select('COALESCE(SUM("user_stars_current_month"."stars"), 0)', 'total_stars')
        .where('"user_stars_current_month"."userId" = :userId', { userId })
        .andWhere('"user_stars_current_month"."type" = :type', { type: starType })
        .andWhere('EXTRACT(YEAR FROM "user_stars_current_month"."created") = :year', {
          year: currentYear,
        })
        .andWhere('EXTRACT(MONTH FROM "user_stars_current_month"."created") = :month', {
          month: currentMonth,
        })
        .getRawOne()

      const currentUserTotalStars = Number(currentUserTotalStarsResult?.total_stars || 0)

      // Calculate current rank
      let currentRank = null
      if (currentUserTotalStars > 0) {
        const currentRankResult = await this.starsService.userStarsRepository
          .createQueryBuilder('user_stars_rank_current_period')
          .select('COUNT(DISTINCT "subQueryCurrent"."userId") + 1', 'rank')
          .from((subQuery) => {
            return subQuery
              .select('"user_stars_sub_current"."userId"', 'userId')
              .addSelect('COALESCE(SUM("user_stars_sub_current"."stars"), 0)', 'totalStarsForRank')
              .from('user_stars', 'user_stars_sub_current')
              .where('"user_stars_sub_current"."type" = :type', { type: starType })
              .andWhere('EXTRACT(YEAR FROM "user_stars_sub_current"."created") = :year', {
                year: currentYear,
              })
              .andWhere('EXTRACT(MONTH FROM "user_stars_sub_current"."created") = :month', {
                month: currentMonth,
              })
              .groupBy('"user_stars_sub_current"."userId"')
              .having(
                'COALESCE(SUM("user_stars_sub_current"."stars"), 0) > :currentUserTotalStars',
                {
                  currentUserTotalStars,
                },
              )
          }, 'subQueryCurrent')
          .getRawOne()
        currentRank = Number(currentRankResult?.rank || 1)
      } else {
        const usersWithStarsCountCurrent = await this.starsService.userStarsRepository
          .createQueryBuilder('user_stars_count_current_period')
          .select('COUNT(DISTINCT "user_stars_count_current_period"."userId")', 'count')
          .where('"user_stars_count_current_period"."type" = :type', { type: starType })
          .andWhere('EXTRACT(YEAR FROM "user_stars_count_current_period"."created") = :year', {
            year: currentYear,
          })
          .andWhere('EXTRACT(MONTH FROM "user_stars_count_current_period"."created") = :month', {
            month: currentMonth,
          })
          .andWhere('"user_stars_count_current_period"."stars" > 0')
          .getRawOne()
        currentRank = Number(usersWithStarsCountCurrent?.count || 0) + 1
      }

      // Get highest rank ever achieved and when it occurred
      const monthlyActivityForUser = await this.starsService.userStarsRepository
        .createQueryBuilder('user_stars_monthly_activity')
        .select('EXTRACT(YEAR FROM "user_stars_monthly_activity"."created")', 'year')
        .addSelect('EXTRACT(MONTH FROM "user_stars_monthly_activity"."created")', 'month')
        .addSelect(
          'COALESCE(SUM("user_stars_monthly_activity"."stars"), 0)',
          'total_stars_in_month',
        )
        .where('"user_stars_monthly_activity"."userId" = :userId', { userId })
        .andWhere('"user_stars_monthly_activity"."type" = :type', { type: starType })
        .groupBy('year, month')
        // Order by year and month to process chronologically if needed, though not strictly necessary for finding *best* rank
        .orderBy('year', 'DESC')
        .addOrderBy('month', 'DESC')
        .getRawMany()

      let highestAchievedRank = null
      let highestRankMonthNumber = null
      let highestRankYearNumber = null

      for (const monthData of monthlyActivityForUser) {
        const userStarsInThisMonth = Number(monthData.total_stars_in_month)
        if (userStarsInThisMonth === 0) continue // Skip if user had no stars in this month

        const periodYear = Number(monthData.year)
        const periodMonth = Number(monthData.month)

        const rankInMonthResult = await this.starsService.userStarsRepository
          .createQueryBuilder('user_stars_rank_historical_period')
          .select('COUNT(DISTINCT "subQueryHistorical"."userId") + 1', 'rank')
          .from((subQuery) => {
            return subQuery
              .select('"user_stars_sub_historical"."userId"', 'userId')
              .addSelect(
                'COALESCE(SUM("user_stars_sub_historical"."stars"), 0)',
                'totalStarsForRank',
              )
              .from('user_stars', 'user_stars_sub_historical')
              .where('"user_stars_sub_historical"."type" = :type', { type: starType })
              .andWhere('EXTRACT(YEAR FROM "user_stars_sub_historical"."created") = :year', {
                year: periodYear,
              })
              .andWhere('EXTRACT(MONTH FROM "user_stars_sub_historical"."created") = :month', {
                month: periodMonth,
              })
              .groupBy('"user_stars_sub_historical"."userId"')
              .having(
                'COALESCE(SUM("user_stars_sub_historical"."stars"), 0) > :userStarsInThisMonth',
                {
                  userStarsInThisMonth,
                },
              )
          }, 'subQueryHistorical')
          .getRawOne()

        const rankInMonth = Number(rankInMonthResult?.rank || 1) // Default to 1 if user has stars and no one is higher

        if (highestAchievedRank === null || rankInMonth < highestAchievedRank) {
          highestAchievedRank = rankInMonth
          highestRankMonthNumber = periodMonth
          highestRankYearNumber = periodYear
        }
      }

      let highestRankMonthName = null
      if (highestRankMonthNumber !== null) {
        highestRankMonthName = DateTime.fromObject({ month: highestRankMonthNumber }).toFormat(
          'MMM',
        )
      }

      profileStats[starType.toLowerCase()] = {
        rank: currentUserTotalStars > 0 ? currentRank : null,
        total_stars: currentUserTotalStars,
        highest_rank: highestAchievedRank,
        highest_rank_date: highestAchievedRank
          ? `${highestRankMonthName}. ${highestRankYearNumber}`
          : null,
      }
    }

    return profileStats
  } catch (error) {
    return HandleErrors(error)
  }
}
