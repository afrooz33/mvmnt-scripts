import { Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { AddDetailsDto } from '@app/src/users/wishlist/dto'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (payload: AddDetailsDto, userId: string): Promise<SuccessRO> {
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
            id: payload.wishlist,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RESOURCE_NOT_FOUND,
        args: { id: payload.wishlist },
      }),
    })

    const details = await this.wishlistVariantRepository.findOne({
      where: {
        wishlist: {
          id: wishlist.id,
        },
        variant: {
          id: payload.variant,
        },
      },
    })

    if (!details) {
      throw new BadRequestException(ErrorKey.WISHLIST_VARIANT_NOT_FOUND)
    }

    await this.wishlistVariantRepository.save({
      ...details,
      ...payload,
    })

    return {
      success: true,
      message: 'Wishlist details added successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
