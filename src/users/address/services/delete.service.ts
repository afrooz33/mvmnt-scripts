import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const address = await this.documentExists({
      condition: [
        {
          where: {
            id,
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
          select: ['id', 'profile', 'is_default'],
        },
      ],
      errorMessage: ErrorKey.ADDRESS_NOT_FOUND,
    })

    await this.updateOne({
      ...address,
      status: UserAddressStatus.DELETED,
      is_default: false,
    })

    const otherAddress = await this.addressRepository.findOne({
      where: {
        profile: {
          id: address.profile.id,
        },
        id: Not(id),
        status: UserAddressStatus.ENABLED,
      },
    })

    if (address.is_default && otherAddress) {
      await this.addressRepository.update(
        {
          id: otherAddress.id,
        },
        {
          is_default: true,
        },
      )
    }

    return {
      message: 'Address successfully deleted',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
