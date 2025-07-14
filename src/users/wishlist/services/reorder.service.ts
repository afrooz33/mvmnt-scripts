import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { ReorderItemDto } from '@app/src/users/wishlist/dto'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (payload: ReorderItemDto, userId: string): Promise<SuccessRO> {
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
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.WISHLIST_NOT_FOUND,
        args: { id: payload.wishlist },
      }),
    })

    const currentItem = await this.wishlistVariantRepository.findOne({
      where: {
        wishlist: {
          id: wishlist.id,
        },
        variant: {
          id: payload.variant,
        },
      },
    })

    const newPosition = payload.sorting_order
    const currentPosition = currentItem.sorting_order

    if (newPosition < currentPosition) {
      await this.wishlistVariantRepository
        .createQueryBuilder()
        .update('wishlist_variants')
        .set({ sorting_order: () => 'sorting_order + 1' })
        .where(
          'sorting_order >= :newPosition AND sorting_order < :currentPosition AND "wishlistId" = :wishlistId',
          { newPosition, currentPosition, wishlistId: payload.wishlist },
        )
        .execute()
    } else if (newPosition > currentPosition) {
      await this.wishlistVariantRepository
        .createQueryBuilder()
        .update('wishlist_variants')
        .set({ sorting_order: () => 'sorting_order - 1' })
        .where(
          'sorting_order > :currentPosition AND sorting_order <= :newPosition AND "wishlistId" = :wishlistId',
          { currentPosition, newPosition, wishlistId: payload.wishlist },
        )
        .execute()
    }

    await this.wishlistVariantRepository
      .createQueryBuilder()
      .update('wishlist_variants')
      .set({ sorting_order: newPosition })
      .where('"variantId" = :itemId  AND "wishlistId" = :wishlistId', {
        itemId: payload.variant,
        wishlistId: payload.wishlist,
      })
      .execute()

    return {
      success: true,
      message: 'Wishlist reordered successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
