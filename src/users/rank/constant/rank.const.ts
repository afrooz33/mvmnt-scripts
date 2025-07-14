import { UserRank } from '@app/src/users/rank/enums'

export const RANK_LIMITS_BALANCE = {
  [UserRank.Silver]: {
    LOWER: 50000,
    UPPER: 100000,
  },
  [UserRank.Gold]: {
    LOWER: 100000,
    UPPER: 500000,
  },
  [UserRank.Premium]: {
    LOWER: 500000,
    UPPER: 1000000,
  },
  [UserRank.Diamond]: {
    LOWER: 1000000,
    UPPER: Number.MAX_VALUE,
  },
}

export const RANK_LIMITS_POINTS = {
  [UserRank.Silver]: 100,
  [UserRank.Gold]: 250,
  [UserRank.Premium]: 1000,
  [UserRank.Diamond]: 2000,
}

export const RANK_LIMITS_FREQUENCY = {
  [UserRank.Silver]: 3,
  [UserRank.Gold]: 6,
  [UserRank.Premium]: 12,
  [UserRank.Diamond]: 15,
}

export const RANK_ORDER: { [key in UserRank]: number } = {
  [UserRank.Bronze]: 0,
  [UserRank.Silver]: 1,
  [UserRank.Gold]: 2,
  [UserRank.Premium]: 3,
  [UserRank.Diamond]: 4,
}
