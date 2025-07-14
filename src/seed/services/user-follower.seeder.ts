import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function (total = 10) {
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const follower = faker.helpers.arrayElement(users).id
          const following = faker.helpers.arrayElement(users).id

          if (follower === following) {
            resolve('success')
          } else {
            await this.entityManager.upsert(
              'users_followers',
              {
                follower,
                following,
              },
              ['follower', 'following'],
            )

            resolve('success')
          }
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
