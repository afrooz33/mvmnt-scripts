import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'

export default function (): DealCategoryEntity {
  const responseObject: any = {
    id: this.id,
    name: this.name,
    type: this.type,
    parent: this.parent,
    status: this.status,
    children: this.children,
    display_order: Number(this.display_order),
  }

  if (this.translations) {
    responseObject.translations = this.translations
  }

  return responseObject
}
