import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { NewsStatus } from '@app/src/nonprofit/news/enums'

export default async function (total = 200) {
  const nonprofitUser: ISeederEntity[] = await this.getNonprofits()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const status = faker.helpers.enumValue(NewsStatus)
          const schedule_date = faker.date.past({ years: 1 })

          await this.entityManager.save('nonprofit_news', {
            title: faker.lorem.words(6),
            details: faker.lorem.paragraphs(3),
            user: faker.helpers.arrayElement(nonprofitUser).id,
            views: faker.number.int({ min: 5, max: 1000 }),
            schedule_date: status === NewsStatus.SCHEDULED ? schedule_date : null,
            published_date: schedule_date,
            status: status === NewsStatus.SCHEDULED ? NewsStatus.PUBLISHED : status,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
