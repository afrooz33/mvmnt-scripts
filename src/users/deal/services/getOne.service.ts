import { In, Not } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default async function (id: string, userId: string): Promise<any> {
  try {
    const exist = await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(In([DealStatus.DELETED, DealStatus.DELETE_REQUESTED])),
          },
          select: ['id', 'name', 'deal_type'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    const deal = await DealEntity.createQueryBuilder('deals')
      .where('deals.id = :id', { id })
      .select([
        'deals.id',
        'deals.name',
        'deals.deal_type',
        'deals.item_condition',
        'deals.shipping_covered_by',
        'deals.size',
        'deals.start_date',
        'deals.end_date',
        'deals.description',
        'deals.starting_price',
        'deals.status',
        'deals.donation_type',
        'deals.donation_amount',
        'deals.currency',
        'deals.purchase_availability',
        'deals.deal_availability',
        'deals.deal_access_date',
        'deals.admin_memo',
        'deals.sender_location',
        'deals.estimated_delivery_days',
        'deals.is_one_of_kind',
        'deals.created',
        'deals.updated',
        'donation_project.id',
        'donation_project.name',
        'donation_project.description',
        'donation_project.goal_amount',
        'donation_project.status',
        'donation_project_images',
        'donation_nonprofit.id',
        'nonprofit_profile_image',
        'brand',
        'category',
        'shipping_method',
        'shipping_method_image',
        'shipping_method_translations',
        'images',
        'nonprofit_profile.id',
        'nonprofit_profile.first_name',
        'nonprofit_profile.last_name',
        'nonprofit_profile.foundation_name',
        'nonprofit_profile.foundation_url',
        'user.id',
        'user.display_name',
        'user.username',
        'user.account_type',
        'user_profile.id',
        'user_profile.introduction',
        'user_profile.social_accounts',
        'user_profile_images',
        'deals.total_bids',
        'deals.share_count',
        'deals.like_count',
        'shipping_fee',
      ])
      .leftJoin('deals.donation_project', 'donation_project')
      .leftJoin('donation_project.images', 'donation_project_images')
      .leftJoin('deals.donation_nonprofit', 'donation_nonprofit')
      .leftJoin('deals.brand', 'brand')
      .leftJoin('deals.category', 'category')
      .leftJoin('deals.shipping_method', 'shipping_method')
      .leftJoin('shipping_method.image', 'shipping_method_image')
      .leftJoin('shipping_method.translations', 'shipping_method_translations')
      .leftJoin('deals.images', 'images')
      .leftJoin('donation_nonprofit.profile', 'nonprofit_profile')
      .leftJoin('nonprofit_profile.profile_image', 'nonprofit_profile_image')
      .leftJoin('deals.user', 'user')
      .leftJoin('user.profile', 'user_profile')
      .leftJoin('user_profile.profile_images', 'user_profile_images')
      .leftJoin('deals.shipping_profiles', 'shipping_profile_deals')
      .leftJoin('deals.shipping_fee', 'shipping_fee')
      .addSelect(
        `(SELECT COUNT(*) FROM "user_deals_likes" "like" WHERE "like"."dealId" = "deals"."id")`,
        'like_count',
      )

    if (exist?.deal_type === DealType.RAFFLE) {
      deal.leftJoin('deals.raffles', 'raffles')
      deal.leftJoin('raffles.raffle_prizes', 'raffle_prizes')
      deal.leftJoin('raffle_prizes.images', 'raffle_prizes_images')

      deal.addSelect(['raffles', 'raffle_prizes', 'raffle_prizes_images', 'deals.participants'])
    }

    if (exist?.deal_type === DealType.BUYNOW) {
      deal.leftJoin('deals.variants', 'variants')
      deal.leftJoin('deals.options', 'options')
      deal.leftJoin('variants.images', 'variants_images')
      deal.leftJoin('variants.option_values', 'option_values')
      deal.leftJoin('option_values.option', 'option')

      deal.addSelect([
        'option',
        'options',
        'variants',
        'variants_images',
        'option_values',
        'deals.participants',
        'deals.buynow_review_count',
        'deals.buynow_rate',
      ])
    }

    const results = await deal.getOne()

    if (!results) {
      throw new NotFoundException(ErrorKey.DEAL_NOT_FOUND)
    }

    if (
      results.sender_location === null ||
      results.shipping_method === null ||
      results.shipping_method === undefined
    ) {
      results.shipping_profiles = await this.shippingProfileRepository
        .createQueryBuilder('shippingProfile')
        .leftJoinAndSelect('shippingProfile.deals', 'deal')
        .leftJoinAndSelect('shippingProfile.origins', 'origins')
        .leftJoinAndSelect('shippingProfile.zones', 'zones')
        .leftJoinAndSelect('zones.countries', 'countries')
        .leftJoinAndSelect('countries.shipping_zone_province', 'province')
        .leftJoinAndSelect('zones.prices', 'prices')
        .where('shippingProfile.all_deals = true')
        .where('shippingProfile.user = :userId', { userId: results.user.id })
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
    }

    if (results.deal_type === DealType.BUYNOW) {
      await Promise.all(
        results.variants.map(async (variant: any) => {
          const quantities = await this.dealVariantInventoryRepository
            .createQueryBuilder('inventory')
            .where('inventory.variantId = :variantId', { variantId: variant.id })
            .select('SUM(inventory.quantity)', 'total')
            .cache(true)
            .getRawOne()

          variant.quantity = Number.parseInt(quantities?.total || '0', 10)

          return variant
        }),
      )
    }

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
