import { Not } from 'typeorm'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserRO } from '@app/src/users/auth/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (id: string): Promise<UserRO> {
  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id,
          account_status: Not(AccountStatus.DELETED),
        },
        relations: [
          Query.PROFILE,
          Query.NONPROFIT,
          `${Query.PROFILE}.${Query.LANGUAGE}`,
          Query.PROFILE_IMAGES,
        ],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  try {
    return {
      ...user.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
