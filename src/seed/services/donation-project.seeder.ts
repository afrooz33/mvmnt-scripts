import { faker } from '@faker-js/faker/locale/ja'
import {
  PostingStatus,
  DonationProjectStatus,
  DonationProjectReviewStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { UploadType } from '@app/src/shared/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'

export default async function (total = 50) {
  const nonprofit: ISeederEntity[] = await this.getNonprofits()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const schedule_date = faker.date.past({ years: 1 })
          const is_schedule = faker.helpers.enumValue(PostingStatus)
          const is_goal_set = faker.helpers.enumValue(PostingStatus)
          const is_deadline_enabled = faker.helpers.enumValue(PostingStatus)

          const images = await this.entityManager.save('images', [
            await this.getFakerImage(UploadType.DONATION_PROJECT, true),
            await this.getFakerImage(UploadType.DONATION_PROJECT),
            await this.getFakerImage(UploadType.DONATION_PROJECT),
            await this.getFakerImage(UploadType.DONATION_PROJECT),
          ])

          await this.entityManager.save('donation_projects', {
            display_order: faker.number.int({ min: 1, max: 200 }),
            name: faker.lorem.sentence(),
            is_schedule,
            is_deadline_enabled,
            is_goal_set,
            schedule_date: is_schedule === PostingStatus.ENABLED ? schedule_date : null,
            deadline_date:
              is_deadline_enabled === PostingStatus.ENABLED
                ? faker.date.future({ refDate: schedule_date })
                : null,
            goal_amount:
              is_goal_set === PostingStatus.ENABLED
                ? faker.number.int({ min: 100000, max: 9999999 })
                : null,
            introduction: faker.lorem.paragraph(),
            description: faker.lorem.paragraphs(),
            published_date: schedule_date,
            donation_presets: [
              faker.number.int({ min: 10, max: 20 }),
              faker.number.int({ min: 30, max: 50 }),
              faker.number.int({ min: 60, max: 100 }),
            ],
            default_donation_preset_amount: faker.number.int({
              min: 0,
              max: 2,
            }),
            review_status: faker.helpers.enumValue(DonationProjectReviewStatus),
            status:
              is_schedule === PostingStatus.ENABLED
                ? DonationProjectStatus.PUBLISHED
                : faker.helpers.enumValue(DonationProjectStatus),
            images,
            tags: await this.getTags(faker.number.int({ min: 3, max: 12 })),
            user: faker.helpers.arrayElement(nonprofit).id,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
