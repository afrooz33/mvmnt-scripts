import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { DeliverySettingsType } from '@app/src/users/delivery-settings/enums'
import { CreateDestinationPreferenceDto } from '@app/src/users/delivery-settings/destination-preference/dto'

export default async function (
  payload: CreateDestinationPreferenceDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    //check if the shipping profiles exists and associated with the user
    const shipping_profiles = await Promise.all(
      payload.shipping_profiles.map(async (shippingProfileId) => {
        const shipping_profile = await this.shippingProfileService.documentExists({
          condition: [
            {
              where: {
                id: shippingProfileId,
                user: {
                  id: user.id,
                },
                status: ShippingProfileStatus.ENABLED,
              },
              select: ['id'],
            },
          ],
          errorMessage: ErrorKey.SHIPPING_PROFILE_NOT_FOUND,
        })

        return shipping_profile
      }),
    )

    //check if all origins from shipping profiles are provided
    const allShippingProfileOrigins = await this.shippingProfileService.findMany({
      where: {
        id: In(shipping_profiles.map((shipping_profile) => shipping_profile.id)),
      },
      relations: ['origins'],
    })

    const allOriginsFromShippingProfiles = allShippingProfileOrigins.reduce(
      (acc, shippingProfile) => {
        return acc.concat(shippingProfile.origins.map((origin) => origin.id))
      },
      [],
    )

    //check if the origins exists and associated with the user and shipping profiles
    const origins = await Promise.all(
      allOriginsFromShippingProfiles.map(async (originId) => {
        const origin = await this.addressService.documentExists({
          condition: [
            {
              where: {
                id: originId,
                status: UserAddressStatus.ENABLED,
                is_personal: false,
                profile: {
                  user: { id: userId },
                },
              },
              select: ['id'],
            },
          ],
          errorMessage: ErrorKey.ADDRESS_NOT_FOUND,
        })

        return origin
      }),
    )

    if (!allOriginsFromShippingProfiles.every((originId) => payload.origins.includes(originId))) {
      throw new BadRequestException(ErrorKey.INVALID_ORIGIN)
    }

    await Promise.all(
      payload.countries.map(async (country) => {
        await Promise.all(
          shipping_profiles.map(async (shipping_profile) => {
            const originsForShippingProfile = allOriginsFromShippingProfiles.filter((origin) => {
              return allShippingProfileOrigins
                .find((sp) => sp.id === shipping_profile.id)
                .origins.find((o) => o.id === origin)
            })

            await Promise.all(
              originsForShippingProfile.map(async (origin) => {
                const countries = await this.entityManager.query(
                  `SELECT DISTINCT "szc"."id"
                    FROM "shipping_profiles" "sp"
                    JOIN "shipping_profile_origins" "spo" ON "sp"."id" = "spo"."shippingProfilesId"
                    JOIN "shipping_zones" "sz" ON "sp"."id" = sz."shippingProfileId"
                    JOIN "shipping_zone_countries" "szc" ON "sz"."id" = "szc"."zoneId"
                    WHERE sp."id" = $1
                    AND spo."userAddressessId" = $2
                    AND szc."countryId" = $3`,
                  [shipping_profile.id, origin, country.country],
                )

                if (!countries.length) {
                  throw new BadRequestException(ErrorKey.INVALID_SHIPPING_REGIONS)
                }

                await Promise.all(
                  country.destination_province.map(async (province) => {
                    const exists = await this.entityManager.query(
                      `SELECT DISTINCT "szp"."id"
                        FROM "shipping_profiles" "sp"
                        JOIN "shipping_profile_origins" "spo" ON "sp"."id" = "spo"."shippingProfilesId"
                        JOIN "shipping_zones" "sz" ON "sp"."id" = "sz"."shippingProfileId"
                        JOIN "shipping_zone_countries" "szc" ON "sz"."id" = "szc"."zoneId"
                        JOIN "shipping_zone_provinces" "szp" ON "szc"."id" = "szp"."shippingZoneCountryId"
                        WHERE sp."id" = $1
                        AND spo."userAddressessId" = $2
                        AND szc."countryId" = $3
                        AND szp."provinceId" = $4`,
                      [shipping_profile.id, origin, country.country, province.province],
                    )

                    if (!exists.length) {
                      throw new BadRequestException(ErrorKey.INVALID_SHIPPING_REGIONS)
                    }
                  }),
                )
              }),
            )
          }),
        )
      }),
    )

    let delivery_settings = await this.deliverySettingService.findOne({
      where: {
        user: {
          id: userId,
        },
        type: DeliverySettingsType.PREFERENCES_BY_DESTINATION,
        is_enabled: true,
      },
      select: ['id'],
    })

    if (!delivery_settings) {
      delivery_settings = await this.deliverySettingService.updateOne({
        type: DeliverySettingsType.PREFERENCES_BY_DESTINATION,
        user: {
          id: userId,
        },
      })
    }

    //check if the destination preference already exists
    const exists = await this.findOne({
      where: {
        user: {
          id: userId,
        },
        delivery_settings,
      },
    })

    const data: any = {
      ...payload,
      ...(exists && { id: exists.id }),
      countries: await Promise.all(
        payload.countries.map(async (country) => ({
          country: country.country,
          destination_province: country.destination_province,
          earliest_days: country.earliest_days,
          destination_preference: exists ? { id: exists.id } : undefined,
        })),
      ),
    }

    await this.entityManager.query(
      `DELETE FROM "delivery_destination_provinces" WHERE "destinationCountryId" IN (SELECT "id" FROM "delivery_destination_countries" WHERE "destinationPreferenceId" = $1)`,
      [data.id],
    )
    await this.entityManager.query(
      `DELETE FROM "delivery_destination_countries" WHERE "destinationPreferenceId" = $1`,
      [data.id],
    )

    await this.updateOne({
      ...data,
      user,
      shipping_profiles,
      origins,
      delivery_settings,
    })

    return {
      success: true,
      message: 'Destination preference successfully created',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
