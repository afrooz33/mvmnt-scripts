import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { SharedSnsPlatform } from '@app/src/users/share/enums'

export default async function (total = 200) {
  const users: ISeederEntity[] = await this.getUsers()
  const donationProjects: ISeederEntity[] = await this.getDonationProjects()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.save('user_donation_projects_shares', {
            donation_project: faker.helpers.arrayElement(donationProjects).id,
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
