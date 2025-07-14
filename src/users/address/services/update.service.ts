import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { UpdateAddressDto } from '@app/src/users/address/dto'
import { UserAddressStatus } from '@app/src/users/address/enums'

export default async function (payload: UpdateAddressDto, userId: string): Promise<SuccessRO> {
  try {
    const address = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
            status: Not(In([UserAddressStatus.DELETED, UserAddressStatus.SYSTEM_DEFAULT])),
            is_personal: false,
            profile: {
              user: {
                id: userId,
                account_status: AccountStatus.ENABLED,
              },
            },
          },
          relations: [Query.PROFILE],
          select: ['id', 'profile.id', 'is_default'],
        },
      ],
      errorMessage: ErrorKey.RESOURCE_NOT_FOUND,
    })

    const country = await this.countryRepository.findOneOrFail({
      where: { id: payload.country },
      select: ['id'],
    })

    const postcode = await this.postcodeRepository.findOneOrFail({
      where: { id: payload.postcode },
      select: ['id'],
    })

    await this.updateOne({
      ...address,
      ...payload,
      country,
      postcode,
    })

    return {
      message: 'Address successfully updated',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
