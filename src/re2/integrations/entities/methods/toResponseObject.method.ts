import { IShopifySalePortionSettingRO } from '@app/src/re2/integrations/interfaces'

export default function (): IShopifySalePortionSettingRO {
  return {
    id: this.id,
    name: this.name,
    donation_type: this.donation_type,
    donation_value: this.donation_value,
    shopify_integration: this.shopify_integration,
    nonprofit: this.nonprofit,
    donation_project: this.donation_project,
    gross_donation: this.gross_donation,
    net_donation: this.net_donation,
    status: this.status,
    created: this.created,
    updated: this.updated,
  }
}
