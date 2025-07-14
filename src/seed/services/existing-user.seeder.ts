import { ILike, Not } from 'typeorm'
import { faker } from '@faker-js/faker/locale/ja'
import { DefaultAddress } from '@app/src/shared/constant'
import { AccountStatus } from '@app/src/users/user/enums'
import { VerificationStatus } from '@app/src/users/profile/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { DisplaySetting, WishlistStatus } from '@app/src/users/wishlist/enums'
import { DeliverySettingStatus, DeliverySettingsType } from '@app/src/users/delivery-settings/enums'

export default async function (arg) {
  let users = []
  const user = arg?.user

  if (!user) {
    users = await this.entityManager.find('users', {
      where: {
        account_status: Not(AccountStatus.DELETED),
      },
      select: ['id'],
    })

    if (!users.length) {
      return
    }
  } else {
    users = [
      {
        id: user,
      },
    ]
  }

  await Promise.all(
    users.map(async (user) => {
      return new Promise(async (resolve, reject) => {
        try {
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
                id: user.id,
              },
            }

            const existingCarrier = await this.entityManager.findOne('delivery_carrier', {
              where: {
                name: data.name,
                user: {
                  id: user.id,
                },
                status: DeliverySettingStatus.ENABLED,
              },
              select: ['id'],
            })

            if (!existingCarrier) {
              await this.entityManager.save('delivery_carrier', data)
            }
          }

          /**
           * Create delivery settings product tag
           */

          let deliverySetting = await this.entityManager.findOne('delivery_settings', {
            where: {
              user: {
                id: user.id,
              },
              type: DeliverySettingsType.PRODUCT_TAG,
              is_enabled: true,
            },
            select: ['id'],
          })

          if (!deliverySetting) {
            deliverySetting = await this.entityManager.save('delivery_settings', {
              user: {
                id: user.id,
              },
              type: DeliverySettingsType.PRODUCT_TAG,
              is_enabled: true,
            })
          }

          const defaultTags = await this.entityManager.findOne('product_tag_settings', {
            where: {
              is_disable_delivery_tag: true,
              status: DeliverySettingStatus.ENABLED,
              delivery_settings: {
                id: deliverySetting.id,
              },
            },
            select: ['id'],
          })

          if (!defaultTags) {
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
          }

          /**
           * Create default destination preference
           */

          let unattendedSetting = await this.entityManager.findOne('delivery_settings', {
            where: {
              user: {
                id: user.id,
              },
              type: DeliverySettingsType.UNATTENDED,
              is_enabled: true,
            },
            select: ['id'],
          })

          if (!unattendedSetting) {
            unattendedSetting = await this.entityManager.save('delivery_settings', {
              user: {
                id: user.id,
              },
              type: DeliverySettingsType.UNATTENDED,
              is_enabled: true,
            })
          }

          const locations = JSON.parse(process.env.DEFAULT_UNATTENDED_DELIVERY_LOCATION)

          await Promise.all(
            locations.map(async (location) => {
              const locationCondition = {
                location,
                delivery_settings: {
                  id: unattendedSetting.id,
                },
              }

              const existingLocation = await this.entityManager.findOne(
                'unattended_delivery_settings',
                {
                  where: locationCondition,
                  select: ['id'],
                },
              )

              if (!existingLocation) {
                await this.entityManager.save('unattended_delivery_settings', locationCondition)
              }
            }),
          )

          /**
           * Create default wishlist
           */

          const wishlist = await this.entityManager.findOne('wishlists', {
            where: {
              user: {
                id: user.id,
              },
            },
            select: ['id'],
          })

          if (!wishlist) {
            await this.entityManager.save('wishlists', {
              title: 'My wishlist',
              description:
                'You can add the items you want to a list and share it with everyone, or use it as your own personal memo.',
              status: WishlistStatus.PRIVATE,
              display_setting: DisplaySetting.MARK_AS_PURCHASED,
              purchase_deadline: null,
              user: {
                id: user.id,
              },
              address: null,
            })
          }

          /**
           * Create default shipping profile
           */

          const country = await this.entityManager.findOne('countries', {
            where: {
              name: ILike(DefaultAddress.MVMNT_ADDRESS_COUNTRY),
            },
            select: ['id'],
          })

          let profile = await this.entityManager.findOne('user_profiles', {
            where: {
              user: {
                id: user.id,
              },
            },
            select: ['id'],
          })

          if (!profile) {
            profile = await this.entityManager.save('user_profiles', {
              introduction: faker.lorem.paragraph(),
              verification_status: VerificationStatus.VERIFIED,
              profile_images: this.getFakerImage('USER_PROFILE_PICTURE', true),
              social_accounts: {
                facebook: faker.internet.url(),
                twitter: faker.internet.url(),
                instagram: faker.internet.url(),
                youtube: faker.internet.url(),
              },
              user: {
                id: user.id,
              },
            })
          }

          let defaultOrigin = await this.entityManager.findOne('user_addressess', {
            where: {
              profile: {
                id: profile.id,
              },
              status: UserAddressStatus.SYSTEM_DEFAULT,
              country: {
                id: country.id,
              },
            },
            select: ['id'],
          })

          if (!defaultOrigin) {
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

            defaultOrigin = await this.entityManager.save('user_addressess', {
              city: DefaultAddress.MVMNT_ADDRESS_CITY,
              street: DefaultAddress.MVMNT_ADDRESS_STREET,
              postcode: postcodes[0].id,
              state: DefaultAddress.MVMNT_ADDRESS_PREFECTURE,
              profile: {
                id: profile.id,
              },
              status: UserAddressStatus.SYSTEM_DEFAULT,
              country: {
                id: country.id,
              },
            })
          }

          const defaultShippingProfile = await this.entityManager.findOne('shipping_profiles', {
            where: {
              user: {
                id: user.id,
              },
              origins: {
                id: defaultOrigin.id,
              },
            },
            select: ['id'],
          })

          if (!defaultShippingProfile) {
            await this.entityManager.save('shipping_profiles', {
              user: {
                id: user.id,
              },
              origins: [
                {
                  id: defaultOrigin.id,
                },
              ],
              all_deals: true,
              name: 'Default',
              status: ShippingProfileStatus.DEFAULT,
            })
          }

          resolve('success')
        } catch (error) {
          reject(error)
        }
      })
    }),
  )
}
