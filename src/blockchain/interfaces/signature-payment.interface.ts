import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

export interface DonationSignatureData {
  nonprofitVault: string
  donor: string
  token: string
  amount: BigNumber | number
  points: BigNumber | number
  paymentId: BigNumber | string
}

export interface PaymentsMetadata {
  adminWallet: ethers.Wallet
  domain: object
  type: Record<string, ethers.TypedDataField[]>
}

export interface PaymentSignature {
  adminWallet: ethers.Wallet
  payment: object
  domain: object
  type: Record<string, ethers.TypedDataField[]>
}

export interface DealPayment {
  productId: string
  price: BigNumber | string
  quantity: number
  adminShare: BigNumber | string
  buyer: string
  buyerPoints: BigNumber | string
  seller: string
  sellerPoints: BigNumber | string
  paymentId: string
  token: string
  donationAmount: BigNumber | string
  nonprofitVault: string
}

export interface SignatureData {
  payments: object
  common: {
    buyer: string
    seller: string
    token: string
    expiry: number
  }
}

export interface BuyNowPayment {
  productId: string
  paymentId: string
  nonprofitVault: string
  price: BigNumber | number
  quantity: BigNumber | number
  adminShare: BigNumber | number
  buyerPoints: BigNumber | number
  sellerPoints: BigNumber | number
  donationAmount: BigNumber | number
}

export interface BuyNowCommon {
  buyer: string
  seller: string
  token: string
}

export interface BuyNowPaymentEthers {
  price: string
  quantity: string
  productId: string
  paymentId: string
  adminShare: string
  buyerPoints: string
  sellerPoints: string
  donationAmount: string
  nonprofitVault: string
}

export interface BuyNowSignCommon {
  buyer: string
  seller: string
  token: string
  expiry: number
  sign: string
}

export interface BuyNowCommonExpiry {
  buyer: string
  seller: string
  token: string
  expiry: number
}

export interface BuyNowSignature {
  payments: BuyNowPaymentEthers[]
  common: BuyNowSignCommon
}

export interface UserWithdrawalData {
  user: string
  token: string
  amount: BigNumber | string
  withdrawId: BigNumber | string
}
