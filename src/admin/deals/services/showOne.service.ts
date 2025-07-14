import { Not, In } from 'typeorm'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import DonationHelper from '@app/src/shared/helpers/Donation.helper'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { SystemFeeEntity } from '@app/src/admin/system-fee/entities/system-fee.entity'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (id: string): Promise<any> {
  try {
    const deal: DealEntity = await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: Not(In([DealStatus.DELETED, DealStatus.DELETE_REQUESTED])),
          },
          select: [
            'id',
            'name',
            'size',
            'brand',
            'user',
            'images',
            'status',
            'created',
            'updated',
            'end_date',
            'category',
            'currency',
            'deal_type',
            'start_date',
            'description',
            'shipping_fee',
            'donation_type',
            'item_condition',
            'starting_price',
            'sender_location',
            'shipping_method',
            'donation_amount',
            'donation_project',
            'donation_nonprofit',
            'shipping_covered_by',
            'estimated_delivery_days',
          ],
          relations: [
            Query.USER,
            Query.BRAND,
            Query.IMAGES,
            Query.CATEGORY,
            Query.SHIPPING_FEE,
            Query.SHIPPING_METHOD,
            Query.DONATION_PROJECT,
            Query.DONATION_NONPROFIT,
            `${Query.SHIPPING_METHOD}.${Query.TRANSLATIONS}`,
            `${Query.SHIPPING_METHOD}.${Query.TRANSLATIONS}.${Query.LANGUAGE}`,
          ],
        },
      ],
      message: ErrorKey.DEAL_NOT_FOUND,
    })

    const systemFee: SystemFeeEntity = await this.systemFeeService.findByUserOrDefault(null)

    const donation_data = await DonationHelper(deal, systemFee, null, deal.starting_price)

    const response = await this.toResponseObject(deal)

    let raffle = {}
    let buynow = {}

    if (deal.deal_type === DealType.RAFFLE) {
      const results: QueryBuilderDataInterface = new QueryBuilder({})
        .addFilter('deal', id)
        .useQuery(this.raffleDealRepository)
        .addRelation('raffle_prizes')
        .addRelation(Query.RAFFLE_PRIZES_IMAGES)
        .create()

      raffle = await results.condition.getOne()
    }

    if (deal.deal_type === DealType.BUYNOW) {
      const results: QueryBuilderDataInterface = new QueryBuilder({})
        .addFilter('deal', id)
        .addRelation('images')
        .addRelation('option_values')
        .addRelation('option_values.option')
        .useQuery(this.buynowRepository)
        .create()

      buynow = await results.condition.getMany()
    }

    let calculated_donation = 0
    let calculated_shipping_fee = 0

    if (deal.deal_type === DealType.AUCTION || deal.deal_type === DealType.RAFFLE) {
      calculated_shipping_fee = deal?.shipping_fee[0]?.fee || 0

      const total_donation = await DonationHelper(
        deal,
        systemFee,
        null,
        deal.starting_price + deal.shipping_fee[0].fee,
      )

      calculated_donation = total_donation.amount
    }

    // ToDo: based on shipping fees calculate revenue fields

    return {
      ...response,
      ...donation_data,
      raffle,
      buynow,
      calculated_donation,
      calculated_shipping_fee,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
