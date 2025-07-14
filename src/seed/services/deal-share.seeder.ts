import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { SharedSnsPlatform } from '@app/src/users/share/enums'

export default async function (total = 200) {
  const deals: ISeederEntity[] = await this.getDeals()
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.save('user_deals_shares', {
            deal: faker.helpers.arrayElement(deals).id,
            user: faker.helpers.arrayElement(users).id,
            social_platform: faker.helpers.enumValue(SharedSnsPlatform),
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
