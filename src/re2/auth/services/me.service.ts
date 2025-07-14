import { Not } from 'typeorm'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/re2/user/enums'

export default async function (user: any): Promise<any> {
  const re2 = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: user.id,
          account_status: Not(AccountStatus.DELETED),
        },
        relations: [Query.PROFILE],
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: user.id },
    }),
  })

  try {
    return {
      ...re2.toResponseObject(),
      jwt_token: user.token,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
