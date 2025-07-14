import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { AccountType } from '@app/src/shared/auth/enums'
import { ShopInfoSettings } from '@app/src/users/user/enums'

export default async function (total = 100) {
  const users: ISeederEntity[] = await this.getBusinessUsers()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      const user = faker.helpers.arrayElement(users)

      let show_shop_details = ShopInfoSettings.DEFAULT

      if (user.account_type === `${AccountType.BUSINESS_SOLE_PROPRIETOR}`) {
        show_shop_details = ShopInfoSettings.ON_REQUEST
      }

      return new Promise(async (resolve, reject) => {
        try {
          await this.entityManager.upsert(
            'user_business_shop_info',
            {
              user: user.id,
              show_shop_details,
              name: faker.company.name(),
              person_in_charge: faker.person.fullName(),
              phone_number: faker.phone.number(),
              address: faker.location.streetAddress(),
              postcode: faker.location.zipCode(),
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
