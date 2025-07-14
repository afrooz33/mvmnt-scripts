export interface PurchaseContext {
  userId: string
  userRole: 'buyer' | 'recipient'
  isWishlist: boolean
  isRecipient: boolean
  isSender: boolean
}
