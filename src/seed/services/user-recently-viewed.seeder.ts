import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function (total = 10) {
  const deals: ISeederEntity[] = await this.getDeals()
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.upsert(
            'user_recently_viewed_deals',
            {
              user: faker.helpers.arrayElement(users).id,
              deal: faker.helpers.arrayElement(deals).id,
            },
            ['user', 'deal'],
          )

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
