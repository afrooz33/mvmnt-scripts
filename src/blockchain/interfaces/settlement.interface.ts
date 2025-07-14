import BigNumber from 'bignumber.js'

export interface NonprofitSettlement {
  token: string
  adminShare: BigNumber | string
  nonprofitWithdrawableFunds: BigNumber | string
}
