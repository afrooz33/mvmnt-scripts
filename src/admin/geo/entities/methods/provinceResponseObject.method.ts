export default function (): any {
  const response = {
    id: this.id,
    name: this.name,
    translations: [],
  }

  if (this.country) {
    response['country'] = this.country.toResponseObject()
  }

  if (this.translations) {
    response.translations = this.translations
  }

  return response
}
