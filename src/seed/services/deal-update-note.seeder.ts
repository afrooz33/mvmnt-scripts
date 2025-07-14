import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function (total = 10) {
  const deals: ISeederEntity[] = await this.getDeals()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.save('deal_update_notes', {
            deal: faker.helpers.arrayElement(deals).id,
            note: faker.lorem.sentence(),
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
