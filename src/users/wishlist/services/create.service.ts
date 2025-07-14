import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { TagStatus } from '@app/src/admin/tags/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { CreateWishlistDto } from '@app/src/users/wishlist/dto'
import { UserAddressStatus } from '@app/src/users/address/enums'

export default async function (payload: CreateWishlistDto, userId: string): Promise<SuccessRO> {
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

    let tag
    let image

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

    const address = await this.addressService.documentExists({
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

    if (payload.purchase_deadline) {
      payload.purchase_deadline = new Date(new Date(payload.purchase_deadline).setHours(23, 59, 59))
    }

    const wishlist = {
      ...payload,
      user,
      image,
      tag,
      address,
    }

    const saved = await this.updateOne(wishlist)

    return {
      success: true,
      message: 'Wishlist successfully saved',
      data: saved,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
