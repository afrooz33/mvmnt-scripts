export default function (): any {
  const response = {
    id: this.id,
    name: this.name,
    code: this.code,
    translations: [],
  }

  if (this.continent) {
    response['continent'] = this.continent.toResponseObject()
  }

  if (this.provinces) {
    response['provinces'] = this.provinces.map((province) => province.toResponseObject())
  }

  if (this.translations) {
    response.translations = this.translations
  }

  return response
}
