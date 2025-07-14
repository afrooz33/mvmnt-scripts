import { ILike } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker/locale/ja'
import { DefaultAddress } from '@app/src/shared/constant'
import { VerificationStatus } from '@app/src/users/profile/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { DisplaySetting, WishlistStatus } from '@app/src/users/wishlist/enums'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import {
  UserGender,
  AccountStatus,
  UserAccountType,
  EmailVerificationStatus,
} from '@app/src/users/user/enums'

export default async function (total = 10) {
  const hash = await bcrypt.genSalt(12)

  const country = await this.entityManager.findOne('countries', {
    where: {
      name: ILike(DefaultAddress.MVMNT_ADDRESS_COUNTRY),
    },
    select: ['id'],
  })

  await Promise.all(
    new Array(total).fill(0).map(async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const username = faker.internet.userName()

          const userExist = await this.entityManager.findOne('users', {
            where: { username },
          })

          if (userExist) {
            return resolve('success')
          }

          const user = await this.entityManager.upsert(
            'users',
            {
              email: faker.internet.email().toLowerCase(),
              password: await bcrypt.hash('Pas$w0rd', hash),
              username,
              display_name: faker.person.firstName(),
              brand_url: faker.internet.url(),
              gender: faker.helpers.enumValue(UserGender),
              account_type: faker.helpers.enumValue(UserAccountType),
              account_status: AccountStatus.ENABLED,
              email_verification: {
                token: faker.string.uuid(),
                status: faker.helpers.enumValue(EmailVerificationStatus),
                request_date: faker.date.past(),
                verification_date: faker.date.recent(),
              },
            },
            ['email'],
          )

          const profile = await this.entityManager.upsert(
            'user_profiles',
            {
              user: user,
              introduction: faker.lorem.paragraph(),
              verification_status: faker.helpers.enumValue(VerificationStatus),
              profile_images: this.getFakerImage('USER_PROFILE_PICTURE', true),
              social_accounts: {
                facebook: faker.internet.url(),
                twitter: faker.internet.url(),
                instagram: faker.internet.url(),
                youtube: faker.internet.url(),
              },
            },
            ['user'],
          )

          /**
           * Create default carrier
           */
          const carrierPrefix = 'DEFAULT_CARRIER_'

          for (let i = 1; ; i++) {
            const carrierName = process.env[`${carrierPrefix}NAME_${i}`]
            const carrierTimeSlot = process.env[`${carrierPrefix}TIMESLOT_${i}`]

            if (!carrierName || !carrierTimeSlot) {
              break
            }

            const data = {
              name: carrierName,
              time_slot: JSON.parse(carrierTimeSlot),
              status: DeliverySettingStatus.ENABLED,
              user: {
                id: user.raw[0].id,
              },
            }

            await this.entityManager.save('delivery_carrier', data)
          }

          /**
           * Create delivery settings product tag
           */

          const deliverySetting = await this.entityManager.save('delivery_settings', {
            user: {
              id: user.raw[0].id,
            },
            type: DeliverySettingsType.PRODUCT_TAG,
            is_enabled: true,
          })

          await this.entityManager.save('product_tag_settings', {
            name: 'Disable delivery date',
            is_disable_delivery_tag: true,
            days_range: null,
            date_range: null,
            status: DeliverySettingStatus.ENABLED,
            delivery_settings: {
              id: deliverySetting.id,
            },
          })

          /**
           * Create default destination preference
           */

          const locations = JSON.parse(process.env.DEFAULT_UNATTENDED_DELIVERY_LOCATION)

          const unattendedSetting = await this.entityManager.save('delivery_settings', {
            user: {
              id: user.raw[0].id,
            },
            type: DeliverySettingsType.UNATTENDED,
            is_enabled: true,
          })

          await Promise.all(
            locations.map(async (location) => {
              await this.entityManager.save('unattended_delivery_settings', {
                location,
                delivery_settings: {
                  id: unattendedSetting.id,
                },
              })
            }),
          )

          /**
           * Create default wishlist
           */

          await this.entityManager.save('wishlists', {
            title: 'My wishlist',
            description:
              'You can add the items you want to a list and share it with everyone, or use it as your own personal memo.',
            status: WishlistStatus.PRIVATE,
            display_setting: DisplaySetting.MARK_AS_PURCHASED,
            purchase_deadline: null,
            user: {
              id: user.raw[0].id,
            },
            address: null,
          })

          /**
           * Create default shipping profile
           */

          let postcodes = await this.entityManager.findOne('postcodes', {
            where: {
              postcode: DefaultAddress.MVMNT_ADDRESS_POSTCODE,
            },
            select: ['id'],
          })

          if (!postcodes) {
            postcodes = await this.entityManager.find('postcodes', {
              select: ['id'],
              limit: 1,
            })
          }

          const defaultOrigin = await this.entityManager.save('user_addressess', {
            city: DefaultAddress.MVMNT_ADDRESS_CITY,
            street: DefaultAddress.MVMNT_ADDRESS_STREET,
            postcode: postcodes[0].id,
            state: DefaultAddress.MVMNT_ADDRESS_PREFECTURE,
            profile: {
              id: profile.id,
            },
            status: UserAddressStatus.SYSTEM_DEFAULT,
            country,
          })

          await this.entityManager.save('shipping_profiles', {
            user: {
              id: user.raw[0].id,
            },
            origin: {
              id: defaultOrigin.id,
            },
            all_deals: true,
            name: 'Default',
            status: ShippingProfileStatus.DEFAULT,
          })

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
