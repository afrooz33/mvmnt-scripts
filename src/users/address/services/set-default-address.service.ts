import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export default async function (addressId: string, userId: string): Promise<SuccessRO> {
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

    const exist: AddressEntity = await this.documentExists({
      condition: [
        {
          where: {
            id: addressId,
            status: UserAddressStatus.ENABLED,
            profile: {
              id: profile.id,
            },
            type: UserAddressType.DELIVERY,
          },
        },
      ],
      errorMessage: ErrorKey.ADDRESS_NOT_FOUND,
    })

    const address: AddressEntity = await this.updateOne({
      id: exist.id,
      profile: {
        id: profile.id,
      },
      is_default: true,
    })

    await this.addressRepository.update(
      {
        profile: {
          id: profile.id,
        },
        id: Not(exist.id),
      },
      {
        is_default: false,
      },
    )

    return {
      data: address,
      message: 'Address set as default',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
