export interface IShopifyCartBannerSettingRO {
  id: string
  name: string
  round_up_total_status: boolean
  add_single_item_status: boolean
  round_up_total_value: number
  shopify_integration: string
  nonprofits: Array<{
    id: string
    first_name: string
    last_name: string
    foundation_name: string
    foundation_url: string
  }>
  donation_projects: Array<{
    id: string
    name: string
  }>
  gross_donation: number
  net_donation: number
  status: string
  created: Date
  updated: Date
}
