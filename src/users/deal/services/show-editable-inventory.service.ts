import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function showEditableInventory(
  id: string,
  userId: string,
): Promise<{ shouldShow: boolean; origins: any[] }> {
  let variant = null
  let shipping_profile

  if (id) {
    variant = await this.dealVariantRepository.findOne({
      where: {
        id,
        deal: {
          user: {
            id: userId,
          },
        },
      },
      relations: [Query.DEAL],
    })

    if (!variant) {
      throw new BadRequestException(ErrorKey.INVALID_VARIANT)
    }
  }

  shipping_profile = await this.shippingProfileRepository.find({
    where: {
      user: {
        id: userId,
      },
      all_deals: true,
      status: ShippingProfileStatus.ENABLED,
    },
    relations: [Query.SHIPPING_ORIGIN],
  })

  if (!shipping_profile) {
    shipping_profile = await this.shippingProfileRepository.find({
      where: {
        user: {
          id: userId,
        },
        variants: {
          id,
        },
        status: ShippingProfileStatus.ENABLED,
      },
      relations: [Query.SHIPPING_ORIGIN],
    })
  }

  if (!shipping_profile) {
    return { shouldShow: false, origins: [] }
  }

  let origins = []

  for (const profile of shipping_profile) {
    origins = profile.origins

    return { shouldShow: true, origins }
  }

  return { shouldShow: false, origins: [] }
}
