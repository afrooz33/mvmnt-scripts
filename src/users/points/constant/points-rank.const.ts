import { UserRank } from '@app/src/users/rank/enums'

export const POINTS_DEAL = {
  [UserRank.Bronze]: 1,
  [UserRank.Silver]: 1.5,
  [UserRank.Gold]: 2,
  [UserRank.Premium]: 3,
  [UserRank.Diamond]: 4,
}

export const POINTS_DIRECT_DONATION = {
  [UserRank.Bronze]: 1,
  [UserRank.Silver]: 1.5,
  [UserRank.Gold]: 2,
  [UserRank.Premium]: 2.5,
  [UserRank.Diamond]: 3,
}

export const POINTS_FUNDRAISER = {
  [UserRank.Bronze]: 1,
  [UserRank.Silver]: 1.5,
  [UserRank.Gold]: 2,
  [UserRank.Premium]: 3,
  [UserRank.Diamond]: 4,
}

export const POINTS_INTEGRATION = {
  [UserRank.Bronze]: 1,
  [UserRank.Silver]: 1.5,
  [UserRank.Gold]: 2,
  [UserRank.Premium]: 3,
  [UserRank.Diamond]: 4,
}
