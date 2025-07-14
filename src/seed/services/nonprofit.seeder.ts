import * as bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker/locale/ja'
import { UploadType } from '@app/src/shared/enums'
import { AccountType } from '@app/src/shared/auth/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { NonprofitProfileStatus } from '@app/src/nonprofit/profile/enums'
import {
  DonationProjectReviewStatus,
  DonationProjectStatus,
} from '@app/src/nonprofit/donation-projects/enums'

export default async function (total = 20) {
  const hash = await bcrypt.genSalt(12)

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const languages: ISeederEntity[] = await this.getLanguages()

          const nonprofitUser = await this.entityManager.save('nonprofit_users', {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: await bcrypt.hash('Pas$w0rd', hash),
            account_type: AccountType.NONPROFIT,
            account_status: faker.helpers.enumValue(AccountStatus),
          })

          await this.entityManager.save('nonprofit_profiles', {
            user: nonprofitUser,
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            notification_email: faker.internet.email(),
            foundation_name: faker.company.name(),
            foundation_url: faker.internet.url(),
            introduction: faker.lorem.paragraph(),
            corporate_number: faker.phone.number(),
            phone: faker.phone.number(),
            social_accounts: {
              facebook: faker.internet.url(),
              twitter: faker.internet.url(),
              instagram: faker.internet.url(),
              youtube: faker.internet.url(),
            },
            donation_presets: [
              faker.number.int({ min: 1, max: 10 }),
              faker.number.int({ min: 11, max: 20 }),
              faker.number.int({ min: 21, max: 30 }),
              faker.number.int({ min: 31, max: 40 }),
              faker.number.int({ min: 41, max: 50 }),
            ],
            default_donation_preset_amount: faker.number.int({
              min: 0,
              max: 4,
            }),
            admin_memo: faker.lorem.paragraph(),
            timezone: faker.location.timeZone(),
            status: faker.helpers.enumValue(NonprofitProfileStatus),
            profile_image: await this.getFakerImage(UploadType.USER_PROFILE_PICTURE, true),
            language: faker.helpers.arrayElement(languages).id,
            tags: await this.getTags(faker.number.int({ min: 3, max: 12 })),
          })

          await this.entityManager.save('donation_projects', {
            display_order: faker.number.int({ min: 1, max: 200 }),
            name: faker.lorem.sentence(),
            introduction: faker.lorem.paragraph(),
            description: faker.lorem.paragraph(),
            review_status: DonationProjectReviewStatus.APPROVED,
            status: DonationProjectStatus.DEFAULT,
            user: nonprofitUser.id,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
