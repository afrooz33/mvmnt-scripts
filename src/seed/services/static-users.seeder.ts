import * as bcrypt from 'bcryptjs'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { faker } from '@faker-js/faker'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function () {
  const hash = await bcrypt.genSalt(12)
  const languages: ISeederEntity[] = await this.getLanguages()

  const users = JSON.parse(
    readFileSync(resolve(process.cwd(), 'src/seed/data/users.json'), 'utf-8'),
  )

  await Promise.all(
    users.map(async (user: any) => {
      return new Promise(async (resolve, reject) => {
        try {
          const userExist = await this.entityManager.findOne('users', {
            where: {
              username: user.username,
            },
          })

          if (userExist) {
            return resolve('success')
          }

          const savedUser = await this.entityManager.save('users', {
            email: user.email,
            gender: user.gender,
            username: user.username,
            brand_url: user.brand_url,
            display_name: user.display_name,
            account_type: user.account_type,
            account_status: user.account_status,
            email_verification: user.email_verification,
            password: await bcrypt.hash('Pas$w0rd', hash),
          })

          await this.entityManager.save(
            'user_profiles',
            {
              user: savedUser,
              introduction: user.profile.introduction,
              profile_images: await this.getFakerImage('USER_PROFILE_PICTURE', true),
              social_accounts: user.profile.social_accounts,
              verification_status: user.profile.verification_status,
              language: faker.helpers.arrayElement(languages).id,
            },
            ['user'],
          )

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
