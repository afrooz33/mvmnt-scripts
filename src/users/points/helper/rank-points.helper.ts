import BigNumber from 'bignumber.js'
import { UserRank } from '@app/src/users/rank/enums'
import { POINTS_DEAL } from '@app/src/users/points/constant/points-rank.const'

export const getUserPoints = (amount: BigNumber, rank: UserRank) => {
  return amount.multipliedBy(POINTS_DEAL[rank]).dividedBy(100)
}
