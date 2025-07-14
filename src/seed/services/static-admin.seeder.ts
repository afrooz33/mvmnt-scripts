import * as bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { AccountStatus, AdminRole } from '@app/src/admin/user/enums'

const admins = [
  {
    email: 'admin@mvmnt.jp',
    status: AccountStatus.ENABLED,
    role: AdminRole.OWNER,
    notification_email: 'notification-admin@mvmnt.jp',
  },
  {
    email: 'staff@mvmnt.jp',
    status: AccountStatus.ENABLED,
    role: AdminRole.STAFF,
    notification_email: 'notification-staff@mvmnt.jp',
  },
  {
    email: 'manager@mvmnt.jp',
    status: AccountStatus.ENABLED,
    role: AdminRole.MANAGER,
    notification_email: 'notification-manager@mvmnt.jp',
  },
]

export default async function () {
  const languages: ISeederEntity[] = await this.getLanguages()
  const hash = await bcrypt.genSalt(12)

  await this.entityManager.delete('admin_profiles', {})
  await this.entityManager.delete('admins', {})

  await Promise.all(
    admins.map(async (admin: any) => {
      return new Promise(async (resolve, reject) => {
        try {
          const savedAdmin = await this.entityManager.save(
            'admins',
            {
              email: admin.email,
              password: await bcrypt.hash('Pas$w0rd', hash),
              status: admin.status,
              role: admin.role,
            },
            ['email'],
          )

          await this.entityManager.save('admin_profiles', {
            admin_user: savedAdmin,
            notification_email: admin.notification_email,
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
