import * as bcrypt from 'bcryptjs'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { faker } from '@faker-js/faker'
import { UploadType } from '@app/src/shared/enums'
import { AccountType } from '@app/src/shared/auth/enums'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { FundraiserStatus, FundraiserType, GoalSettings } from '@app/src/re2/fundraisers/enums'

export default async function () {
  const hash = await bcrypt.genSalt(12)

  const users = JSON.parse(
    readFileSync(resolve(process.cwd(), 'src/seed/data/re2-users.json'), 'utf-8'),
  )

  const nonprofitUser: ISeederEntity[] = await this.getNonprofits()
  const donationProject: ISeederEntity[] = await this.getDonationProjects()

  await Promise.all(
    users.map(async (user: any) => {
      try {
        const isNonprofit = faker.datatype.boolean()

        const userExist = await this.entityManager.findOne('re2_users', {
          where: {
            email: user.email,
          },
        })

        if (userExist) {
          return 'success'
        }

        const savedUser = await this.entityManager.save('re2_users', {
          email: user.email,
          account_type: AccountType.RE2,
          account_status: user.account_status,
          password: await bcrypt.hash('Pas$w0rd', hash),
        })

        await this.entityManager.save(
          're2_profiles',
          {
            user: savedUser,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            notification_email: user.profile.notification_email,
            company_name: user.profile.company_name,
            phone: user.profile.phone,
            timezone: faker.location.timeZone(),
          },
          ['user'],
        )

        for (let i = 0; i < 10; i++) {
          const goal_settings = faker.helpers.enumValue(GoalSettings)

          const images = await this.entityManager.save('images', [
            await this.getFakerImage(UploadType.FUNDRAISER_FORM_PAGE, true),
            await this.getFakerImage(UploadType.FUNDRAISER_FORM_PAGE, false),
            await this.getFakerImage(UploadType.FUNDRAISER_FORM_PAGE, false),
            await this.getFakerImage(UploadType.FUNDRAISER_FORM_PAGE, false),
            await this.getFakerImage(UploadType.FUNDRAISER_FORM_PAGE, false),
          ])

          const selectedNonprofits = isNonprofit
            ? []
            : Array.from(
                new Set(
                  Array.from({ length: 10 }, () => faker.helpers.arrayElement(nonprofitUser).id),
                ),
              )
                .slice(0, 3)
                .map((id) => ({ id }))

          const selectedDonationProjects = !isNonprofit
            ? []
            : Array.from(
                new Set(
                  Array.from({ length: 10 }, () => faker.helpers.arrayElement(donationProject).id),
                ),
              )
                .slice(0, 3)
                .map((id) => ({ id }))

          await this.entityManager.save('re2_fundraisers', {
            user: savedUser,
            title: faker.lorem.sentence(),
            public_url: faker.internet.url(),
            description: faker.lorem.paragraph(),
            hex_page_color: faker.internet.color(),
            hex_form_color: faker.internet.color(),
            goal_settings,
            type: faker.helpers.enumValue(FundraiserType),
            goal_amount:
              goal_settings === GoalSettings.ENABLED
                ? faker.number.int({ min: 1000, max: 100000 })
                : null,
            start_date: faker.date.past(),
            end_date: faker.date.future(),
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
            images,
            nonprofit: selectedNonprofits,
            donation_projects: selectedDonationProjects,
            status: faker.helpers.enumValue(FundraiserStatus),
          })
        }

        return 'success'
      } catch (error) {
        console.error('Error processing user:', user.email, error)
        throw error
      }
    }),
  )
}
