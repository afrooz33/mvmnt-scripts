import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

export const bigNumberToString = (obj: object, precision: number): any => {
  const result = {}
  for (const key in obj) {
    if (obj[key] instanceof BigNumber) {
      result[key] = ethers
        .parseUnits(obj[key].toFixed(precision, BigNumber.ROUND_UP), precision)
        .toString()
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = bigNumberToString(obj[key], precision)
    } else {
      result[key] = obj[key]
    }
  }

  return result
}
