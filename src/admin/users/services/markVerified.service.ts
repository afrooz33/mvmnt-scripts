import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (id: string, action: string): Promise<SuccessRO> {
  try {
    const user = await this.documentExists({
      condition: [
        {
          where: {
            id,
            account_status: Not(AccountStatus.DELETED),
          },
          select: ['id', 'is_verified'],
        },
      ],
      message: ErrorKey.USER_NOT_FOUND,
    })

    user.is_verified = action === 'verified' ? true : false

    await this.updateOne(user)

    return {
      success: true,
      message: `User [${id}] has been processed successfully`,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
