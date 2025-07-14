import * as csv from 'csvtojson'
import { resolve } from 'node:path'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function () {
  const path = resolve(process.cwd(), 'src/seed/csv/postcodes/US.csv')
  const country: ISeederEntity[] = await this.getCountries('USA')

  if (!country.length) return

  const data = await csv({
    noheader: false,
    delimiter: ';',
  }).fromFile(path)

  for (const code of data) {
    const payload = {
      postcode: code['postal code'].trim(),
      place: code['place name'].trim(),
      state: code['admin name1'].trim(),
      city: code['admin name2'].trim(),
      latitude: code['latitude'].trim(),
      longitude: code['longitude'].trim(),
      country: {
        id: country[0].id,
      },
    }

    await this.entityManager.upsert('postcodes', payload, ['postcode', 'country'])
  }
}
