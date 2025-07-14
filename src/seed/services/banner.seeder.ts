import { faker } from '@faker-js/faker/locale/ja'
import { UploadType } from '@app/src/shared/enums'
import { BannerSection, BannerStatus } from '@app/src/admin/banners/enums'

export default async function (total = 10) {
  await this.entityManager.delete('banners', {})

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.save('banners', {
            display_order: faker.number.int({ min: 1, max: 50 }),
            section: faker.helpers.enumValue(BannerSection),
            image_sp: await this.getFakerImage(UploadType.BANNER),
            image_pc: await this.getFakerImage(UploadType.BANNER),
            url: faker.internet.url(),
            status: faker.helpers.enumValue(BannerStatus),
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
