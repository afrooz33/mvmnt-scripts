import { DealType } from '@app/src/users/deal/enums'
import { ActionButton, PurchaseItem } from './'

export interface PurchaseItemGroup {
  id: string
  title: string
  title_type: 'delivery_date' | 'shipping_date' | 'no_shipping' | 'return_exchange' | 'cancellation'
  status_text: string
  status_date: Date | string
  delivery_date?: Date | string
  delivery_time_slot?: string
  is_shipped: boolean
  deal_type: DealType
  cartId?: string
  bidId?: string
  rafflePurchaseId?: string
  shipping_info?: any
  return_exchange_info?: any
  cancellation_info?: any
  available_actions: string[]
  action_buttons: ActionButton[]
  items: PurchaseItem[]
  estimated_delivery_days?: number
  is_wishlist?: boolean
  delivery_address?: any
}
