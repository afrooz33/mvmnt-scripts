import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { CreateAddressDto } from '@app/src/users/address/dto'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export default async function createService(
  payload: CreateAddressDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.profileRepository)
      .addFilter('user', userId)
      .addRelation(Query.USER)
      .create()

    result.condition.andWhere(`"user"."account_status" IN (:...account_status)`, {
      account_status: [AccountStatus.ENABLED],
    })

    const profile = await result.condition.getOne()

    if (!profile) {
      throw new PreconditionFailedException(ErrorKey.PROFILE_NOT_FOUND)
    }

    const country = await this.countryRepository.findOneOrFail({
      where: { id: payload.country },
      select: ['id'],
    })

    const postcode = await this.postcodeRepository.findOneOrFail({
      where: { id: payload.postcode },
      select: ['id'],
    })

    const totalAddress = await this.addressRepository.count({
      where: {
        profile: {
          id: profile.id,
        },
        is_personal: false,
        is_default: true,
        type: UserAddressType.SHIPPING,
        status: Not(In([UserAddressStatus.DELETED, UserAddressStatus.SYSTEM_DEFAULT])),
      },
    })

    const address = await this.addressRepository.create(payload)

    if (!totalAddress) {
      address.is_default = true
    }

    address.profile = profile
    address.country = country
    address.postcode = postcode

    await this.addressRepository.save(address)

    return {
      message: 'Address created successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
