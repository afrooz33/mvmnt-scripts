import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (id: string): Promise<unknown> {
  try {
    const count = await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .leftJoinAndSelect('wishlist.variants', 'variant')
      .where('wishlist.id = :wishlistId', { wishlistId: id })
      .andWhere('wishlist.status != :deletedStatus', { deletedStatus: WishlistStatus.DELETED })
      .andWhere('wishlist.status != :privateStatus', { privateStatus: WishlistStatus.PRIVATE })
      .andWhere('variant.id IS NOT NULL')
      .getCount()

    if (!count) {
      throw new NotFoundException(ErrorKey.WISHLIST_NOT_FOUND)
    }

    return await this.wishlistRepository.findOne({
      where: { id },
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
