import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (userId: string): Promise<SuccessRO> {
  try {
    return await this.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          relations: [Query.SHOP_INFO],
          select: ['id', 'shop_info'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
