import BigNumber from 'bignumber.js'
import { POINTS_TYPE } from '@app/src/users/points/enums'

export interface PointsInfo {
  type: POINTS_TYPE
  amount: BigNumber
  delivery_date: Date
  expiry_date: Date
}

export interface BuyerSellerPoints {
  buyer: {
    total: BigNumber
    points: PointsInfo[]
  }
  seller: {
    total: BigNumber
    points: PointsInfo[]
  }
}
