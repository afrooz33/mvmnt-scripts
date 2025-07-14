import BigNumber from 'bignumber.js'

export interface RefundSignatureData {
  buyer: string
  seller: string
  token: string
  amount: BigNumber
  refundId: BigNumber
  originTransactionId: BigNumber
}

export interface RefundSignatureResult {
  sign: string
  refund: {
    buyer: string
    seller: string
    token: string
    amount: string
    refundId: string
    originTransactionId: string
    expiry: number
  }
}
