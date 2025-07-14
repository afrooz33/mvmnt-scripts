import {
  RANK_LIMITS_BALANCE,
  RANK_LIMITS_FREQUENCY,
  RANK_LIMITS_POINTS,
} from '@app/src/users/rank/constant/rank.const'
import { UserRank } from '@app/src/users/rank/enums'
import BigNumber from 'bignumber.js'

export const calculateRankBalance = function (balance: BigNumber): UserRank {
  if (balance.isLessThan(RANK_LIMITS_BALANCE.Silver.LOWER)) return UserRank.Bronze
  else if (
    balance.isGreaterThanOrEqualTo(RANK_LIMITS_BALANCE.Silver.LOWER) &&
    balance.isLessThan(RANK_LIMITS_BALANCE.Silver.UPPER)
  )
    return UserRank.Silver
  else if (
    balance.isGreaterThanOrEqualTo(RANK_LIMITS_BALANCE.Premium.LOWER) &&
    balance.isLessThan(RANK_LIMITS_BALANCE.Premium.UPPER)
  )
    return UserRank.Premium
  else return UserRank.Diamond
}

export const calculateRankPointsTotal = function (points: number): UserRank {
  if (points > RANK_LIMITS_POINTS[UserRank.Diamond]) return UserRank.Diamond
  if (points > RANK_LIMITS_POINTS[UserRank.Premium]) return UserRank.Premium
  if (points > RANK_LIMITS_POINTS[UserRank.Gold]) return UserRank.Gold
  if (points > RANK_LIMITS_POINTS[UserRank.Silver]) return UserRank.Silver

  return UserRank.Bronze
}

export const calculateRankPointsFrequency = function (frequency: number): UserRank {
  if (frequency > RANK_LIMITS_FREQUENCY[UserRank.Diamond]) return UserRank.Diamond
  if (frequency > RANK_LIMITS_FREQUENCY[UserRank.Premium]) return UserRank.Premium
  if (frequency > RANK_LIMITS_FREQUENCY[UserRank.Gold]) return UserRank.Gold
  if (frequency > RANK_LIMITS_FREQUENCY[UserRank.Silver]) return UserRank.Silver

  return UserRank.Bronze
}
