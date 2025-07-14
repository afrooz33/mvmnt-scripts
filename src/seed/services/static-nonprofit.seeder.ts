import * as bcrypt from 'bcryptjs'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { faker } from '@faker-js/faker'
import { UploadType } from '@app/src/shared/enums'
import { AccountType } from '@app/src/shared/auth/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { NonprofitProfileStatus } from '@app/src/nonprofit/profile/enums'

export default async function () {
  const hash = await bcrypt.genSalt(12)
  const languages: ISeederEntity[] = await this.getLanguages()

  const users = JSON.parse(
    readFileSync(resolve(process.cwd(), 'src/seed/data/nonprofit-users.json'), 'utf-8'),
  )

  await Promise.all(
    users.map(async (user: any) => {
      return new Promise(async (resolve, reject) => {
        try {
          const exist = await this.entityManager.findOne('nonprofit_users', {
            where: {
              email: user.email,
            },
          })

          if (exist) {
            return resolve('success')
          }

          const nonprofitUser = await this.entityManager.save('nonprofit_users', {
            name: user.name,
            email: user.email,
            password: await bcrypt.hash('Pas$w0rd', hash),
            account_type: AccountType.NONPROFIT,
            account_status: AccountStatus.ACTIVE,
          })

          await this.entityManager.save('nonprofit_profiles', {
            user: nonprofitUser,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            notification_email: user.profile.notification_email,
            foundation_name: user.profile.foundation_name,
            foundation_url: user.profile.foundation_url,
            introduction: user.profile.introduction,
            corporate_number: user.profile.corporate_number,
            phone: user.profile.phone,
            social_accounts: user.profile.social_accounts,
            donation_presets: Array.from({ length: 5 }, (_, i) =>
              faker.number.int({ min: 1 + i * 10, max: 10 + i * 10 }),
            ),
            default_donation_preset_amount: faker.number.int({
              min: 0,
              max: 4,
            }),
            admin_memo: faker.lorem.paragraph(),
            timezone: faker.location.timeZone(),
            status: NonprofitProfileStatus.APPROVED,
            profile_image: await this.getFakerImage(UploadType.USER_PROFILE_PICTURE, true),
            language: faker.helpers.arrayElement(languages).id,
            tags: await this.getTags(faker.number.int({ min: 3, max: 12 })),
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
