import { IShopifyCartDrawerSettingRO } from '@app/src/re2/integrations/interfaces'

export default function (): IShopifyCartDrawerSettingRO {
  return {
    id: this.id,
    name: this.name,
    shopify_integration: this.shopify_integration,
    nonprofits: this.nonprofits,
    donation_projects: this.donation_projects,
    gross_donation: 0,
    net_donation: 0,
    status: this.status,
    created: this.created,
    updated: this.updated,
  }
}
