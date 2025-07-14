import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { StarType } from '@app/src/users/stars/enums'
import { UserStarPercentileRankingResponse } from '@app/src/users/rankings/interfaces'

export default async function (
  userId: string,
  starType: StarType,
): Promise<UserStarPercentileRankingResponse> {
  try {
    // Initialize the structure that will hold the percentile counts
    const resultShell: UserStarPercentileRankingResponse = {
      percentile_counts: {
        top_1_percent: 0,
        top_2_percent: 0,
        top_3_percent: 0,
        top_4_percent: 0,
        top_5_percent: 0,
        top_6_percent: 0,
        top_7_percent: 0,
        top_8_percent: 0,
        top_9_percent: 0,
        top_10_percent: 0,
      },
    }

    // Get all distinct months/years the user earned stars of the specified type
    const monthlyActivityForUser = await this.starsService.userStarsRepository
      .createQueryBuilder('activity')
      .select('EXTRACT(YEAR FROM activity.created) as "year"')
      .addSelect('EXTRACT(MONTH FROM activity.created) as "month"')
      .where('activity."userId" = :userId', { userId })
      .andWhere('activity.type = :starType', { starType })
      .andWhere('activity.stars > 0')
      .groupBy('year, month')
      .orderBy('"year"', 'DESC')
      .addOrderBy('"month"', 'DESC')
      .getRawMany()

    if (!monthlyActivityForUser || monthlyActivityForUser.length === 0) {
      // If no activity, return the initialized counts
      return resultShell
    }

    for (const period of monthlyActivityForUser) {
      const periodYear = Number(period.year)
      const periodMonth = Number(period.month)

      // 1. Get user's total stars in this specific period
      const userTotalStarsResult = await this.starsService.userStarsRepository
        .createQueryBuilder('uts') // UserTotalStars
        .select('COALESCE(SUM(uts.stars), 0)', 'total_stars')
        .where('uts."userId" = :userId', { userId })
        .andWhere('uts.type = :starType', { starType })
        .andWhere('EXTRACT(YEAR FROM uts.created) = :periodYear', { periodYear })
        .andWhere('EXTRACT(MONTH FROM uts.created) = :periodMonth', { periodMonth })
        .getRawOne()
      const userStarsInThisMonth = Number(userTotalStarsResult?.total_stars || 0)

      if (userStarsInThisMonth === 0) {
        // Skip if user had no stars in this month (should be rare due to initial filter)
        continue
      }

      // 2. Get user's rank in this specific period
      const rankedUsersSubQuery = this.starsService.userStarsRepository
        .createQueryBuilder('s_rank') // StarRank subquery
        .select('s_rank."userId"', 'userId')
        .addSelect('COALESCE(SUM(s_rank.stars), 0)', 'monthly_total_stars')
        .where('s_rank.type = :starType', { starType })
        .andWhere('EXTRACT(YEAR FROM s_rank.created) = :periodYear', { periodYear })
        .andWhere('EXTRACT(MONTH FROM s_rank.created) = :periodMonth', { periodMonth })
        .groupBy('s_rank."userId"')
        .having('COALESCE(SUM(s_rank.stars), 0) > :userStarsInThisMonth', { userStarsInThisMonth })

      const rankResult = await this.starsService.userStarsRepository
        .createQueryBuilder('rank_calc') // RankCalculation
        .select('COUNT(higher_ranked_users."userId") + 1', 'rank')
        .from(`(${rankedUsersSubQuery.getQuery()})`, 'higher_ranked_users')
        .setParameters(rankedUsersSubQuery.getParameters())
        .getRawOne()
      const rankInMonth = Number(rankResult?.rank || 1)

      // 3. Get total number of participants in this period for this starType
      const totalParticipantsResult = await this.starsService.userStarsRepository
        .createQueryBuilder('tp') // TotalParticipants
        .select('COUNT(DISTINCT tp."userId")', 'total_participants')
        .where('tp.type = :starType', { starType })
        .andWhere('EXTRACT(YEAR FROM tp.created) = :periodYear', { periodYear })
        .andWhere('EXTRACT(MONTH FROM tp.created) = :periodMonth', { periodMonth })
        .andWhere('tp.stars > 0')
        .getRawOne()
      const totalParticipantsInMonth = Number(totalParticipantsResult?.total_participants || 0)

      if (rankInMonth !== null) {
        // Calculate which percentile the user falls into
        const userPercentile = (rankInMonth / totalParticipantsInMonth) * 100

        // Increment percentile counts based on which percentiles the user was in
        for (let p = 1; p <= 10; p++) {
          if (userPercentile <= p) {
            resultShell.percentile_counts[`top_${p}_percent`]++
          }
        }
      }
    }

    return resultShell
  } catch (error) {
    return HandleErrors(error)
  }
}
