import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { CreateShippingProfileDto } from '@app/src/users/shipping-profiles/dto'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export default async function (
  payload: CreateShippingProfileDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const originalPayload = JSON.parse(JSON.stringify(payload))

    const user = await this.userService.userRepository.findOneOrFail({
      where: { id: userId, account_status: AccountStatus.ENABLED },
      select: ['id'],
    })

    const origins = await this.addressService.findMany({
      where: {
        id: In(payload.origins),
        status: UserAddressStatus.ENABLED,
        is_personal: false,
        profile: {
          user: { id: userId },
        },
        type: UserAddressType.SHIPPING,
      },
      select: ['id'],
      relations: [Query.PROFILE],
    })

    if (origins.length !== payload.origins.length) {
      throw new BadRequestException('Invalid origin address')
    }

    payload.all_deals = originalPayload.all_deals = true

    if (payload.deals?.length) {
      const deals = await this.dealService.findMany({
        where: {
          id: In(payload.deals),
          user: { id: userId },
          status: Not(DealStatus.DELETED),
        },
        select: ['id'],
      })

      if (deals.length !== payload.deals.length) {
        throw new BadRequestException('Invalid deal')
      }

      payload.all_deals = false
      payload.deals = deals
    }

    if (payload.variants?.length) {
      const variants = await this.dealVariantRepository.find({
        where: {
          id: In(payload.variants),
          deal: {
            user: { id: userId },
            status: Not(DealStatus.DELETED),
          },
        },
        select: ['id'],
      })

      if (variants.length !== payload.variants.length) {
        throw new BadRequestException('Invalid variant')
      }

      payload.all_deals = false
      payload.variants = variants
    }

    const isProfileValid = await this.isShippingProfileValid(userId, payload)

    if (!isProfileValid) {
      throw new BadRequestException(ErrorKey.SHIPPING_PROFILE_SETTING_EXISTS)
    }

    for (const zone of payload.zones) {
      if (!zone.countries.length) {
        throw new BadRequestException('Countries are required')
      }

      for (const country of zone.countries) {
        await this.geoService.countryRepository.findOneOrFail({
          where: { id: country.id },
          select: ['id'],
        })

        if (country?.shipping_zone_province?.length) {
          for (const province of country.shipping_zone_province) {
            await this.geoService.provinceRepository.findOneOrFail({
              where: {
                id: province.id,
                country: {
                  id: country.id,
                },
              },
              select: ['id'],
            })
          }
        }
      }
    }

    const zones = payload.zones.map((zone) => ({
      ...zone,
      countries: zone.countries.map((country) => ({
        country: {
          id: country.id,
        },
        shipping_zone_province:
          country.shipping_zone_province && country.shipping_zone_province.length
            ? country.shipping_zone_province.map((province) => ({
                province: {
                  id: province.id,
                },
              }))
            : [],
      })),
    }))

    const shipping_profile = await this.updateOne({
      ...payload,
      origins,
      zones,
      user,
    })

    //identify if selected deals and its variants have missing deal variant quantity for selected origins
    let message = 'Shipping profile created successfully'

    const updatedCount = await this.updateDealVariantsQuantity(userId, originalPayload)

    if (updatedCount > 0) {
      message = `${updatedCount} variants inventories are set to 0 in selected origins`
    }

    return {
      success: true,
      message,
      data: shipping_profile,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
