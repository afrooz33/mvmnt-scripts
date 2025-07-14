import { Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { MoveWishlistDto } from '@app/src/users/wishlist/dto'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (payload: MoveWishlistDto, userId: string): Promise<SuccessRO> {
  try {
    if (payload.old_wishlist === payload.new_wishlist) {
      throw new PreconditionFailedException(
        JSON.stringify({
          key: ErrorKey.MOVE_NOT_ALLOWED_IN_SAME_WISHLIST,
        }),
      )
    }

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

    const old_wishlist = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.old_wishlist,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.WISHLIST_NOT_FOUND,
        args: { id: payload.old_wishlist },
      }),
    })

    const new_wishlist = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.new_wishlist,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.WISHLIST_NOT_FOUND,
        args: { id: payload.new_wishlist },
      }),
    })

    const isValidMove = await this.wishlistVariantRepository
      .createQueryBuilder('wishlist_variants')
      .where('wishlist_variants."wishlistId" = :wishlistId', { wishlistId: old_wishlist.id })
      .andWhere('wishlist_variants."variantId" = :variantId', { variantId: payload.variant })
      .getRawOne()

    if (!isValidMove) {
      throw new PreconditionFailedException(ErrorKey.WISHLIST_ITEM_NOT_FOUND)
    }

    const exist = await this.wishlistVariantRepository
      .createQueryBuilder('wishlist_variants')
      .where('wishlist_variants."wishlistId" = :wishlistId', { wishlistId: new_wishlist.id })
      .andWhere('wishlist_variants."variantId" = :variantId', { variantId: payload.variant })
      .getRawOne()

    if (exist) {
      throw new PreconditionFailedException(ErrorKey.WISHLIST_ITEM_ALREADY_EXISTS)
    }

    if (!exist) {
      const maxSortingOrder = await this.wishlistVariantRepository
        .createQueryBuilder('wishlist_variants')
        .select('MAX(wishlist_variants.sorting_order)', 'max')
        .where('wishlist_variants."wishlistId" = :wishlistId', { wishlistId: payload.new_wishlist })
        .getRawOne()

      const sortingOrder = maxSortingOrder.max !== null ? maxSortingOrder.max + 1 : 1

      await this.wishlistVariantRepository
        .createQueryBuilder()
        .insert()
        .into('wishlist_variants')
        .values({
          wishlist: payload.new_wishlist,
          variant: payload.variant,
          sorting_order: sortingOrder,
        })
        .orUpdate({
          conflict_target: ['wishlistId', 'variantId'],
          overwrite: ['sorting_order'],
        })
        .execute()

      await this.wishlistVariantRepository
        .createQueryBuilder()
        .delete()
        .from('wishlist_variants')
        .where('wishlist_variants."wishlistId" = :wishlistId', { wishlistId: old_wishlist.id })
        .andWhere('wishlist_variants."variantId" = :variantId', { variantId: payload.variant })
        .execute()
    }

    return {
      success: true,
      message: 'Wishlist moved successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
