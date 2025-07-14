import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function (total = 20) {
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.upsert(
            'deal_templates',
            {
              title: faker.commerce.productName(),
              content: faker.commerce.productDescription(),
              user: faker.helpers.arrayElement(users).id,
            },
            ['title'],
          )

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
