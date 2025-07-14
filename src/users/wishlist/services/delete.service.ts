import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
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
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
        },
      ],
      errorMessage: ErrorKey.RESOURCE_NOT_FOUND,
    })

    const isWishlistPurchased = await this.cartRepository.findOne({
      where: {
        wishlist: {
          id,
        },
        status: Not(In([CartStatus.PENDING])),
      },
    })

    if (isWishlistPurchased) {
      throw new PreconditionFailedException(ErrorKey.WISHLIST_CANNOT_DELETE)
    }

    await this.wishlistRepository.update({ id }, { status: WishlistStatus.DELETED })

    return {
      success: true,
      message: 'Wishlist deleted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
