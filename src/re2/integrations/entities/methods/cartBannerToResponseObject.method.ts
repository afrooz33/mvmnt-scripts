import { IShopifyCartBannerSettingRO } from '@app/src/re2/integrations/interfaces'

export default function (): IShopifyCartBannerSettingRO {
  return {
    id: this.id,
    name: this.name,
    round_up_total_status: this.round_up_total_status,
    add_single_item_status: this.add_single_item_status,
    round_up_total_value: this.round_up_total_value,
    shopify_integration: this.shopify_integration,
    nonprofits: this.nonprofits,
    donation_projects: this.donation_projects,
    gross_donation: this.gross_donation,
    net_donation: this.net_donation,
    status: this.status,
    created: this.created,
    updated: this.updated,
  }
}
