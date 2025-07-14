import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { UpdateShippingProfileDto } from '@app/src/users/shipping-profiles/dto'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export default async function (
  payload: UpdateShippingProfileDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const existingProfile = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
            user: {
              id: userId,
            },
            status: ShippingProfileStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      message: ErrorKey.RESOURCE_NOT_FOUND,
    })

    const updatePayload: any = {
      ...existingProfile,
    }

    const originalPayload = JSON.parse(JSON.stringify(payload))

    updatePayload.name = payload.name

    if (payload.deals) {
      updatePayload.deals = payload.deals
    }

    await this.userService.userRepository.findOneOrFail({
      where: { id: userId, account_status: AccountStatus.ENABLED },
      select: ['id'],
    })

    updatePayload.origins = await this.addressService.findMany({
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

    if (updatePayload.origins.length !== payload.origins.length) {
      throw new BadRequestException(ErrorKey.INVALID_ORIGIN)
    }

    updatePayload.all_deals = updatePayload.all_deals = true

    if (payload.deals && payload.deals.length) {
      const deals = await this.dealService.findMany({
        where: {
          id: In(payload.deals),
          user: { id: userId },
          status: Not(DealStatus.DELETED),
        },
        select: ['id'],
      })

      if (payload.deals && deals.length !== payload.deals.length) {
        throw new BadRequestException(ErrorKey.DEAL_NOT_FOUND)
      }

      updatePayload.all_deals = false
      updatePayload.deals = deals.map((deal) => ({
        id: deal.id,
        shipping_profile: { id: existingProfile.id },
      }))
    }

    if (payload.variants && payload.variants.length) {
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

      updatePayload.all_deals = false
      updatePayload.variants = variants.map((variant) => ({
        id: variant.id,
        shipping_profile: { id: existingProfile.id },
      }))
    }

    const isProfileValid = await this.isShippingProfileValid(userId, payload)

    if (!isProfileValid) {
      throw new BadRequestException(ErrorKey.SHIPPING_PROFILE_SETTING_EXISTS)
    }

    for (const zone of payload.zones) {
      if (zone.countries.length === 0) {
        throw new BadRequestException('Countries are required')
      }

      for (const country of zone.countries) {
        await this.geoService.countryRepository.findOneOrFail({
          where: { id: country.country_id },
          select: ['id'],
        })

        if (country.shipping_zone_province && country.shipping_zone_province.length) {
          for (const province of country.shipping_zone_province) {
            await this.geoService.provinceRepository.findOneOrFail({
              where: {
                id: province.province_id,
                country: {
                  id: country.country_id,
                },
              },
              select: ['id'],
            })
          }
        }
      }
    }

    updatePayload.zones = payload.zones.map((zone) => ({
      ...zone,
      shipping_profile: existingProfile,
      countries: zone.countries.map((country) => ({
        id: country.id,
        zone: {
          id: zone.id,
        },
        country: {
          id: country.country_id,
        },
        shipping_zone_province:
          country.shipping_zone_province && country.shipping_zone_province.length
            ? country.shipping_zone_province.map((province) => ({
                id: province.id,
                province: {
                  id: province.province_id,
                },
                shipping_zone_country: {
                  id: country.id,
                },
              }))
            : [],
      })),
    }))

    await this.updateOne(updatePayload)

    //identify if selected deals and its variants have missing deal variant quantity for selected origins
    let message = 'Shipping profile updated successfully'

    const updatedCount = await this.updateDealVariantsQuantity(userId, originalPayload)

    if (updatedCount > 0) {
      message = `${updatedCount} variants inventories are set to 0 in selected origins`
    }

    return {
      success: true,
      message,
      data: updatePayload,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
