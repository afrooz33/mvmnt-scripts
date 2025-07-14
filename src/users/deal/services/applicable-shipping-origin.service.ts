import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function (user: string, deal?: string, variant?: string): Promise<any> {
  try {
    let shipping_profile

    const shippingProfileConditions = [
      variant && {
        variants: { id: variant },
        all_deals: false,
        status: ShippingProfileStatus.ENABLED,
      },
      deal && { deals: { id: deal }, all_deals: false, status: ShippingProfileStatus.ENABLED },
      { all_deals: true, status: ShippingProfileStatus.ENABLED },
      { all_deals: true, status: ShippingProfileStatus.DEFAULT },
    ].filter(Boolean)

    for (const condition of shippingProfileConditions) {
      shipping_profile = await this.shippingProfileRepository.findOne({
        where: {
          user: { id: user },
          ...condition,
        },
        select: ['id', 'origins', 'status'],
        relations: [Query.SHIPPING_ORIGIN],
      })

      if (shipping_profile) break
    }

    if (!shipping_profile) {
      throw new BadRequestException(ErrorKey.SHIPPING_PROFILE_NOT_FOUND)
    }

    const isDefault = shipping_profile.status === ShippingProfileStatus.DEFAULT

    if (isDefault) {
      return {
        success: true,
        is_default: true,
        origin: shipping_profile.origins[0]?.id || null,
      }
    }

    const origins = shipping_profile.origins.map((o) => o.id)

    return {
      success: true,
      is_default: false,
      origin: origins,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
