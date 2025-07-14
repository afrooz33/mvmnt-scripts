import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function (total = 5) {
  const languages: ISeederEntity[] = await this.getLanguages()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const translations = []

          for (const language of languages) {
            translations.push({
              language: language.id,
              name: faker.lorem.words({ min: 2, max: 5 }),
              company: faker.company.name(),
              max_size: faker.commerce.productAdjective(),
              max_weight: faker.commerce.productAdjective(),
              price: faker.commerce.price(),
              details_url: faker.internet.url(),
              description: faker.commerce.productDescription(),
            })
          }

          await this.entityManager.save('shipping_methods', {
            display_order: faker.helpers.rangeToNumber({ min: 1, max: 100 }),
            name: faker.commerce.productName(),
            image: this.getFakerImage('SHIPPING_METHOD', true),
            translations,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
