import { BadRequestException } from '@nestjs/common'
import { Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { DealType } from '@app/src/users/deal/enums'
import DonationHelper from '@app/src/shared/helpers/Donation.helper'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (id: string): Promise<SuccessRO> {
  try {
    const variant = await this.buynowRepository.findOne({
      where: {
        id,
        deal: {
          deal_type: DealType.BUYNOW,
        },
      },
      relations: [Query.DEAL, Query.DEAL_USER, `${Query.DEAL}.${Query.SHIPPING_FEE}`],
    })

    if (!variant) {
      throw new BadRequestException('Deal variant not found')
    }

    const system_fee = await this.systemFeeService.findByUserOrDefault()

    const calculation = await DonationHelper(
      variant.deal,
      system_fee,
      variant.deal?.user,
      variant.price,
    )

    let shipping_fee = 0

    if (variant.deal.shipping_fee) {
      for (const fee of variant.deal.shipping_fee) {
        if (
          variant.price >= fee.min_amount &&
          (variant.price <= fee.max_amount || !fee.max_amount)
        ) {
          shipping_fee = fee.fee
          break
        }
      }
    } else {
      const shipping_profiles = await this.shippingProfileRepository
        .createQueryBuilder('shippingProfile')
        .leftJoinAndSelect('shippingProfile.deals', 'deal')
        .leftJoinAndSelect('shippingProfile.origins', 'origins')
        .leftJoinAndSelect('shippingProfile.zones', 'zones')
        .leftJoinAndSelect('zones.countries', 'countries')
        .leftJoinAndSelect('countries.shipping_zone_province', 'province')
        .leftJoinAndSelect('zones.prices', 'prices')
        .where('shippingProfile.all_deals = true')
        .where('shippingProfile.user = :userId', { userId: variant.deal.user.id })
        .orWhere('deal.id = :dealId', { dealId: variant.deal.id })
        .orWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from('shipping_profile_deals', 'spd')
            .where('spd."shippingProfilesId" = "shippingProfile".id')
            .getQuery()
          return `EXISTS ${subQuery}`
        })
        .getOne()

      if (shipping_profiles) {
        const prices = shipping_profiles?.zones

        const fees = []

        for (const price of prices) {
          for (const fee of price.prices) {
            fees.push(fee)
          }
        }

        for (const fee of fees) {
          if (
            variant.price >= fee.range.start &&
            (variant.price <= fee.range.end || !fee.range.start)
          ) {
            shipping_fee = fee.price
            break
          }
        }
      }
    }

    return {
      success: true,
      message: 'Donation calculated successfully',
      data: {
        ...calculation,
        shipping_fee,
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
