interface BrandResponse {
  id: string
  name: string
  display_order: number
  status: string
  created: string
  updated: string
  translations: any[]
}

export default function transformBrand(): BrandResponse {
  const brandResponse: BrandResponse = {
    id: this.id,
    name: this.name,
    display_order: Number(this.display_order),
    status: this.status,
    created: this.created,
    updated: this.updated,
    translations: [],
  }

  if (this.translations) {
    brandResponse.translations = this.translations
  }

  return brandResponse
}
