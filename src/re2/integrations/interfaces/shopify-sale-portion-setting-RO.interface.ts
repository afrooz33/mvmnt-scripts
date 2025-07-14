export interface IShopifySalePortionSettingRO {
  id: string
  name: string
  donation_type: string
  donation_value: number
  shopify_integration: string
  nonprofit: {
    id: string
    first_name: string
    last_name: string
    foundation_name: string
    foundation_url: string
  }
  donation_project: {
    id: string
    name: string
  }
  gross_donation: number
  net_donation: number
  status: string
  created: Date
  updated: Date
}
