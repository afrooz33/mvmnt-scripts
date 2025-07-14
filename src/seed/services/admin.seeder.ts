import * as bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { AccountStatus, AdminRole } from '@app/src/admin/user/enums'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'

export default async function (total = 10) {
  const languages: ISeederEntity[] = await this.getLanguages()
  const hash = await bcrypt.genSalt(12)

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const adminEmail = `admin_${faker.internet.email().toLowerCase()}`

          const admin = await this.entityManager.save(AdminUserEntity, {
            email: adminEmail,
            password: await bcrypt.hash('Pas$w0rd', hash),
            status: AccountStatus.ENABLED,
            role: faker.helpers.enumValue(AdminRole),
          })

          await this.entityManager.save('admin_profiles', {
            admin_user: admin,
            notification_email: adminEmail,
            timezone: faker.location.timeZone(),
            language: faker.helpers.arrayElement(languages).id,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
