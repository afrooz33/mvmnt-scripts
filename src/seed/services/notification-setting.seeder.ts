import { NotificationSettingType } from '@app/src/notifications/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function () {
  const users: ISeederEntity[] = await this.getUsers()

  await Promise.all(
    users.map(async (user) => {
      return new Promise(async (resolve, reject) => {
        try {
          for (const type in NotificationSettingType) {
            await this.entityManager.upsert(
              'notification_settings',
              {
                user: user.id,
                type,
                status: true,
              },
              ['user', 'type'],
            )
          }

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )

  return
}
