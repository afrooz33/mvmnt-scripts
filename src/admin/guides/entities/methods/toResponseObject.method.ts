import { GuidesEntity } from '@app/src/admin/guides/entities/guides.entity'

export default function (): GuidesEntity {
  const responseObject: any = {
    id: this.id,
    name: this.name,
    display_order: Number(this.display_order),
    parent: this.parent,
    children: this.children,
    level: this.level,
    status: this.status,
    total_childs: this.total_childs,
    updated: this.updated,
    created: this.created,
  }

  if (this.translations) {
    responseObject.translations = this.translations
  }

  return responseObject
}
