import { Not } from 'typeorm'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (id: string, userId: string): Promise<any> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: userId },
      }),
    })

    const wishlist = await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
          relations: [Query.TAG, Query.ADDRESS, Query.IMAGE],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RESOURCE_NOT_FOUND,
        args: { id },
      }),
    })

    return { wishlist }
  } catch (error) {
    return HandleErrors(error)
  }
}
