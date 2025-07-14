import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export default async function (total = 10) {
  const profiles: ISeederEntity[] = await this.getUserProfile()
  const country: ISeederEntity[] = await this.getCountries()
  const postcode: ISeederEntity[] = await this.getPostcodes()

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const profile = faker.helpers.arrayElement(profiles).id

          await this.entityManager.save('user_addressess', {
            profile,
            country: faker.helpers.arrayElement(country).id,
            state: faker.location.state(),
            city: faker.location.city(),
            street: faker.location.streetAddress(),
            postcode: faker.helpers.arrayElement(postcode).id,
            phone_number: faker.phone.number(),
            building: faker.location.secondaryAddress(),
            is_default: false,
            type: faker.helpers.enumValue(UserAddressType),
            name: {
              first_name: faker.person.firstName(),
              last_name: faker.person.lastName(),
              kanji: {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
              },
              kana: {
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
              },
            },
            status: UserAddressStatus.ENABLED,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
