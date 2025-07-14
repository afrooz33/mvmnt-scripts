import { Not, In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (userId: string): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: Not(
              In([AccountStatus.DELETED, AccountStatus.DISABLED, AccountStatus.BLOCKED]),
            ),
          },
          relations: [Query.IDENTITY_DOCUMENTS, Query.PROFILE],
          select: ['id', 'identity_documents', 'profile'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: userId },
      }),
    })

    return {
      success: true,
      message: 'Profile successfully retrieved',
      data: user,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
