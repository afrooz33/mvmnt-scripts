import { In } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function showService(
  shippingProfileIds: string | string[],
  userId: string,
): Promise<unknown> {
  try {
    const profileIds = Array.isArray(shippingProfileIds) ? shippingProfileIds : [shippingProfileIds]

    const user = await this.userService.userRepository.findOneOrFail({
      where: {
        id: userId,
        account_status: AccountStatus.ENABLED,
      },
      select: ['id'],
    })

    const shippingProfiles = await this.shippingProfileRepository.find({
      where: {
        id: In(profileIds),
        user: { id: user.id },
        status: ShippingProfileStatus.ENABLED,
      },
      select: ['id'],
    })

    if (shippingProfiles.length !== profileIds.length) {
      throw new NotFoundException(ErrorKey.SHIPPING_PROFILE_NOT_FOUND)
    }

    const validProfileIds = shippingProfiles.map((profile) => profile.id)

    const origins = await this.addressService.addressRepository
      .createQueryBuilder('origin')
      .select([
        'origin.id',
        'origin.name',
        'origin.city',
        'origin.state',
        'origin.street',
        'origin.building',
      ])
      .innerJoin('shipping_profile_origins', 'spo', 'spo.userAddressessId = origin.id')
      .where('spo.shippingProfilesId IN (:...profileIds)', { profileIds: validProfileIds })
      .andWhere('origin.status = :status', { status: UserAddressStatus.ENABLED })
      .getMany()

    const countriesWithProvinces = await this.shippingZoneCountriesRepository
      .createQueryBuilder('szc')
      .select([
        'szc.id AS shipping_zone_country_id',
        'c.id AS country_id',
        'c.name AS country_name',
        'szp.id AS shipping_zone_province_id',
        'p.id AS province_id',
        'p.name AS province_name',
      ])
      .innerJoin('szc.zone', 'zone')
      .innerJoin('zone.shipping_profile', 'profile')
      .innerJoin('countries', 'c', 'c.id = szc.countryId')
      .leftJoin('shipping_zone_provinces', 'szp', 'szp.shippingZoneCountryId = szc.id')
      .leftJoin('provinces', 'p', 'p.id = szp.provinceId')
      .where('profile.id IN (:...profileIds)', { profileIds: validProfileIds })
      .getRawMany()

    const countriesMap = new Map()
    countriesWithProvinces.forEach((row) => {
      if (!countriesMap.has(row.country_id)) {
        countriesMap.set(row.country_id, {
          id: row.country_id,
          name: row.country_name,
          provinces: new Map(),
        })
      }
      const country = countriesMap.get(row.country_id)
      if (row.province_id && !country.provinces.has(row.province_id)) {
        country.provinces.set(row.province_id, {
          id: row.province_id,
          name: row.province_name,
        })
      }
    })

    const result = {
      origins: origins.map(({ id, name, city, state, street, building }) => ({
        id,
        name,
        city,
        state,
        street,
        building,
      })),
      countries: Array.from(countriesMap.values()).map((country) => ({
        id: country.id,
        name: country.name,
        provinces: Array.from(country.provinces.values()),
      })),
    }

    return result
  } catch (error) {
    return HandleErrors(error)
  }
}
