import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'
import { DealType } from '@app/src/users/deal/enums'

export default async function (total = 200) {
  const deals: ISeederEntity[] = await this.getDealsByType(DealType.BUYNOW)
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const deal = faker.helpers.arrayElement(deals)
          const user = faker.helpers.arrayElement(users).id

          if (deal.userId === user) {
            return resolve('success')
          } else {
            await this.entityManager.save('user_deal_review', {
              deal: deal.id,
              user,
              description: faker.lorem.paragraph(),
              rating: faker.number.int({ min: 1, max: 5 }),
              status: faker.helpers.enumValue(DealRatingStatus),
            })

            resolve('success')
          }
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
