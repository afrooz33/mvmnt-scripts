import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (
  action: string,
  variantId: string,
  wishlistId: string,
  userId: string,
): Promise<SuccessRO> {
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
            id: wishlistId,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.WISHLIST_NOT_FOUND,
    })

    const variant = await this.dealVariantRepository.findOne({
      where: {
        id: variantId,
        deal: {
          deal_type: DealType.BUYNOW,
          status: In([DealStatus.ENDED, DealStatus.ON_DEAL]),
        },
      },
      select: ['id'],
    })

    if (!variant) {
      throw new PreconditionFailedException(ErrorKey.DEAL_NOT_FOUND)
    }

    if (action === 'remove') {
      await this.wishlistVariantRepository
        .createQueryBuilder()
        .delete()
        .from('wishlist_variants')
        .where('wishlist_variants."wishlistId" = :wishlistId', { wishlistId })
        .andWhere('wishlist_variants."variantId" = :variantId', { variantId })
        .execute()
    } else if (action === 'add') {
      const maxSortingOrder = await this.wishlistVariantRepository.count({
        where: {
          wishlist: {
            id: wishlistId,
          },
        },
      })

      const sortingOrder = maxSortingOrder + 1

      await this.wishlistVariantRepository
        .createQueryBuilder()
        .insert()
        .into('wishlist_variants')
        .values({
          wishlist: wishlistId,
          variant: variantId,
          sorting_order: sortingOrder,
        })
        .orIgnore({
          conflict_target: ['wishlistId', 'variantId'],
        })
        .execute()
    } else {
      throw new PreconditionFailedException(ErrorKey.INVALID_WISHLIST_ACTION)
    }

    return {
      success: true,
      message: 'Wishlist successfully updated',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
