import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function (deal: string, variant: string, dealUser: any): Promise<any> {
  try {
    let shipping_profile

    //first, check if the user has a shipping profile for the variant
    //second, check if the user has a shipping profile for the deal
    //third, check if the user has a shipping profile for all deals
    //fourth, check if the user has a default shipping profile for all deals
    const shippingProfileConditions = [
      { variants: { id: variant }, all_deals: false, status: ShippingProfileStatus.ENABLED },
      { deals: { id: deal }, all_deals: false, status: ShippingProfileStatus.ENABLED },
      { all_deals: true, status: ShippingProfileStatus.ENABLED },
      { all_deals: true, status: ShippingProfileStatus.DEFAULT },
    ]

    for (const condition of shippingProfileConditions) {
      shipping_profile = await this.shippingProfileRepository.findOne({
        where: {
          user: { id: dealUser },
          ...condition,
        },
        select: ['id', 'origins'],
        relations: [Query.SHIPPING_ORIGIN],
      })

      if (shipping_profile) break
    }

    if (!shipping_profile) {
      throw new BadRequestException(ErrorKey.SHIPPING_PROFILE_NOT_FOUND)
    }

    const origins = await Promise.all(shipping_profile.origins.map((o) => o.id))

    const inventory = await this.dealVariantInventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)::int', 'quantity')
      .where('inventory.variantId = :variantId', { variantId: variant })
      .andWhere('inventory.originId IN (:...origins)', { origins })
      .getRawOne()

    return {
      inventory,
      shipping_profile,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
