import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query, UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { TagStatus } from '@app/src/admin/tags/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { UpdateWishlistDto } from '@app/src/users/wishlist/dto'
import { UserAddressStatus } from '@app/src/users/address/enums'

export default async function (payload: UpdateWishlistDto, userId: string): Promise<SuccessRO> {
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

    const wishlist = await this.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
            status: Not(WishlistStatus.DELETED),
            user: {
              id: user.id,
            },
          },
          relations: [Query.IMAGE, Query.TAG, Query.ADDRESS],
        },
      ],
      errorMessage: ErrorKey.RESOURCE_NOT_FOUND,
    })

    let tag = wishlist.tag || null
    let image = wishlist.image || null
    let address = wishlist.address || null

    if (payload.image) {
      image = await this.imagesService.documentExists({
        condition: [
          {
            where: {
              id: payload.image,
              section: UploadType.WISHLIST,
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.IMAGE_NOT_FOUND,
      })
    }

    if (payload.tag) {
      tag = await this.tagsService.documentExists({
        condition: [
          {
            where: {
              id: payload.tag,
              status: TagStatus.ACTIVE,
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.TAG_NOT_FOUND,
      })
    }

    if (payload.address) {
      address = await this.addressService.documentExists({
        condition: [
          {
            where: {
              id: payload.address,
              profile: {
                user: {
                  id: userId,
                  account_status: AccountStatus.ENABLED,
                },
              },
              status: UserAddressStatus.ENABLED,
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.ADDRESS_NOT_FOUND,
      })
    }

    await this.updateOne({
      ...wishlist,
      ...payload,
      image,
      tag,
      address,
    })

    return {
      success: true,
      message: 'Wishlist updated successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
