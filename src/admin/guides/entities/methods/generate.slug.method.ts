import slugify from 'slugify'

export default async function (): Promise<void> {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: 'en',
      remove: undefined,
    })
  }
}
