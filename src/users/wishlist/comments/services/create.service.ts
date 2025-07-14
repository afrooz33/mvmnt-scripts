import { Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { CreateWishlistCommentDto } from '@app/src/users/wishlist/comments/dto'

export default async function (
  payload: CreateWishlistCommentDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    let parent = null

    const wishlist = await this.wishlistVariantRepository.findOne({
      where: {
        wishlist: {
          id: payload.wishlist,
          status: Not(WishlistStatus.DELETED),
        },
        variant: {
          id: payload.variant,
        },
      },
      relations: [Query.WISHLIST, Query.VARIANT, `${Query.WISHLIST}.${Query.USER}`],
    })

    if (!wishlist) {
      throw new BadRequestException(ErrorKey.INVALID_WISHLIST_VARIANT)
    }

    const isWishlistOwner = wishlist.wishlist.user.id === userId

    // Find if user has purchased the wishlist item
    const hasPurchased = await this.buynowCartRepository.findOne({
      where: {
        wishlist: {
          id: wishlist.wishlist.id,
        },
        user: {
          id: userId,
        },
      },
      select: {
        id: true,
        is_anonymous: true,
      },
    })

    // Allow comment only if user is wishlist owner OR has purchased the item
    if (!isWishlistOwner && !hasPurchased) {
      throw new BadRequestException(ErrorKey.CAN_NOT_COMMENT_ON_WISHLIST)
    }

    if (payload.parent) {
      parent = await this.documentExists({
        condition: [
          {
            where: {
              id: payload.parent,
            },
            select: ['id'],
          },
        ],
        errorMessage: JSON.stringify({
          key: ErrorKey.RESOURCE_NOT_FOUND,
          args: { id: payload.parent },
        }),
      })
    }

    // Set is_anonymous based on user type and purchase type
    // For wishlist owner, never anonymous
    // For purchaser, use the purchase anonymity status
    const isAnonymous = isWishlistOwner ? false : hasPurchased?.is_anonymous || false

    await this.updateOne({
      comment: payload.comment,
      user: {
        id: userId,
      },
      is_anonymous: isAnonymous,
      parent,
      wishlist_variant: {
        id: wishlist.id,
      },
    })

    return {
      success: true,
      message: 'Wishlist comment posted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
