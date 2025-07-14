import { ShippingMethodEntity } from '@app/src/admin/shipping-methods/entities/shipping-method.entity'

export default function (): ShippingMethodEntity {
  const responseObject: any = {
    id: this.id,
    display_order: Number(this.display_order),
    status: this.status,
    updated: this.updated,
    created: this.created,
  }

  if (this.translations) {
    responseObject.translations = this.translations
  }

  if (this.image) {
    responseObject.image = this.image
  }

  return responseObject
}
