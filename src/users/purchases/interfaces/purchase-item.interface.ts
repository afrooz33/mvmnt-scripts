import { DealType } from '@app/src/users/deal/enums'
import { ActionButton } from './'

export interface PurchaseItem {
  id: string
  deal_id: string
  deal_name: string
  deal_type: DealType
  variant?: any
  quantity: number
  total?: number
  bid_amount?: number
  total_amount?: number
  estimated_delivery_days?: number
  image_url?: string
  is_shipped: boolean
  is_wishlist?: boolean
  available_actions?: ActionButton[]
  action_buttons?: ActionButton[]
  need_review?: boolean
  delivery_address?: any
}
