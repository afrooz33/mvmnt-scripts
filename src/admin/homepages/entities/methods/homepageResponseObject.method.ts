import { PageResponseObject } from '@app/src/admin/homepages/interfaces'

export default function (): PageResponseObject {
  const responseObject: any = {
    id: this.id,
    display_order: this.display_order,
    type: this.type,
    title: this.title,
    status: this.status,
    selection: this.selection,
    search_type: this.search_type,
  }

  if (this.translations) {
    responseObject.translations = this.translations.map((translation) =>
      translation.toResponseObject(),
    )
  }

  if (this.search_conditions) {
    responseObject.search_conditions = this.search_conditions.map((condition) =>
      condition.toResponseObject(),
    )
  }

  if (this.contents) {
    responseObject.contents = this.contents.map((content) => content.toResponseObject())
  }

  return responseObject
}
