export default function (): any {
  const response = {
    id: this.id,
    name: this.name,
    translations: [],
  }

  if (this.countries) {
    response['countries'] = this.countries.map((country) => country.toResponseObject())
  }

  if (this.translations) {
    response.translations = this.translations
  }

  return response
}
