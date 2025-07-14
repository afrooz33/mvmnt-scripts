import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { DisplaySetting, WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (userId: string): Promise<SuccessRO> {
  try {
    const total = await this.wishlistRepository.count({
      where: {
        user: {
          id: userId,
        },
      },
    })

    if (total) {
      return {
        success: true,
        message: 'Default wishlist already exists',
      }
    }

    const address = await this.addressRepository.findOne({
      where: {
        is_default: true,
        profile: {
          user: {
            id: userId,
          },
        },
        status: UserAddressStatus.ENABLED,
      },
      select: ['id'],
    })

    const defaultWishlist = await this.wishlistRepository.save({
      title: 'My wishlist',
      description:
        'You can add the items you want to a list and share it with everyone, or use it as your own personal memo.',
      status: WishlistStatus.PRIVATE,
      display_setting: DisplaySetting.MARK_AS_PURCHASED,
      purchase_deadline: null,
      user: {
        id: userId,
      },
      address: address ?? null,
    })

    return {
      success: true,
      message: 'Default wishlist created successfully',
      data: defaultWishlist,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
