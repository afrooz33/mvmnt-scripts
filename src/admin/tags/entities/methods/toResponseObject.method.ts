import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'

export default function (): TagEntity {
  const responseObject: any = {
    id: this.id,
    display_order: Number(this.display_order),
    name: this.name,
    status: this.status,
    updated: this.updated,
    created: this.created,
  }

  if (this.translations) {
    responseObject.translations = this.translations
  }

  return responseObject
}
