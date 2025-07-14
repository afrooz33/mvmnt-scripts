import { SubgraphEvents } from '@app/src/transaction-processor/enums'

export interface GraphQLBaseEvent {
  id?: string
  blockNumber?: string
  transactionHash?: string
  timestamp?: string
}

export interface GraphQLDealPayment extends GraphQLBaseEvent {
  paymentId: string
  productId?: string
}

export interface GraphQLDonationPayment extends GraphQLBaseEvent {
  paymentId: string
  unsettledAmount: string
  donationType: number
}

export interface GraphQLUserWithdrawInitiate extends GraphQLBaseEvent {
  withdrawId: string
  unlockTime: number
}

export interface GraphQLUserWithdrawComplete extends GraphQLBaseEvent {
  withdrawId: string
}

export interface GraphQLUserWithdrawReverted extends GraphQLBaseEvent {
  withdrawId: string
}

export interface GraphQLNonprofitWithdraw extends GraphQLBaseEvent {
  token: string
  withdrawer: string
  amount?: string
}

export interface GraphQLNonprofitFundsReceived extends GraphQLBaseEvent {
  token: string
  nonprofitVault: string
  amount?: string
  donationType?: number
}

export interface GraphQLNonprofitFundsSettled extends GraphQLBaseEvent {
  id: string
  token?: string
  amount?: string
}

export interface GraphQLNonprofitVaultDeployed extends GraphQLBaseEvent {
  projectId: string
  nonprofitVault: string
}

export interface GraphQLTokenStatusUpdated extends GraphQLBaseEvent {
  token: string
  status: number
}

export interface GraphQLRecurringDonationDeactivated extends GraphQLBaseEvent {
  id: string
}

export type PaymentType = SubgraphEvents

export type KnownGraphQLPaymentTypes =
  | GraphQLDealPayment
  | GraphQLDonationPayment
  | GraphQLUserWithdrawInitiate
  | GraphQLUserWithdrawComplete
  | GraphQLUserWithdrawReverted
  | GraphQLNonprofitWithdraw
  | GraphQLNonprofitFundsReceived
  | GraphQLNonprofitFundsSettled
  | GraphQLNonprofitVaultDeployed
  | GraphQLTokenStatusUpdated
  | GraphQLRecurringDonationDeactivated

export interface PaymentHandler {
  queryName: string
  queryFragment: string
  processEvent: (eventData: KnownGraphQLPaymentTypes, transactionHash?: string) => Promise<void>
}
