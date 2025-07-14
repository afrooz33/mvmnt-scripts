import { Request } from 'express'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'
import { ResellingEventType } from '@app/src/users/reselling/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums/payment-status.enum'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'

@Injectable()
export class ShowOneDealService {
  constructor(
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(DealVariantEntity)
    private readonly dealVariantRepository: Repository<DealVariantEntity>,
    @InjectRepository(DealVariantInventoryEntity)
    private readonly dealVariantInventoryRepository: Repository<DealVariantInventoryEntity>,
    @InjectRepository(ShippingProfileEntity)
    private readonly shippingProfileRepository: Repository<ShippingProfileEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getShippingProfile(userId: string, status: ShippingProfileStatus) {
    // Using IN clause instead of EXISTS for better performance
    const shippingProfileDeals = await this.shippingProfileRepository
      .createQueryBuilder('sp')
      .select('sp.id')
      .leftJoin('sp.deals', 'spd')
      .where('sp.user = :userId', { userId })
      .andWhere('sp.status = :status', { status })
      .andWhere('sp.all_deals = true OR spd.id IS NOT NULL')
      .getMany()

    if (!shippingProfileDeals.length) return null

    return await this.shippingProfileRepository
      .createQueryBuilder('shippingProfile')
      .leftJoinAndSelect('shippingProfile.zones', 'zones')
      .leftJoinAndSelect('zones.prices', 'prices')
      .where('shippingProfile.id IN (:...ids)', {
        ids: shippingProfileDeals.map((sp) => sp.id),
      })
      .cache(true)
      .getOne()
  }

  private async transformVariantOptions(data: any) {
    const typeValuesDict: Record<string, Set<string>> = {}

    try {
      for (const variant of data) {
        for (const item of variant.option_values) {
          const itemType = item.option.type
          // If it's a color, use label_name; otherwise use the value
          const value = itemType === 'COLOR' && item.label_name ? item.label_name : item.value

          if (!typeValuesDict[itemType]) {
            typeValuesDict[itemType] = new Set()
          }
          typeValuesDict[itemType].add(value)
        }
      }
    } catch (error) {
      return []
    }

    return Object.entries(typeValuesDict).map(([type, values]) => ({
      type,
      values: Array.from(values),
    }))
  }

  private async loadRaffleData(dealId: string) {
    return await this.dealRepository
      .createQueryBuilder('deals')
      .where('deals.id = :dealId', { dealId })
      .select(['deals.id'])
      .leftJoin('deals.raffles', 'raffles')
      .leftJoin('raffles.raffle_prizes', 'raffle_prizes')
      .leftJoin('raffle_prizes.images', 'raffle_prizes_images')
      .addSelect(['raffles', 'raffle_prizes', 'raffle_prizes_images'])
      .cache(true)
      .getOne()
  }

  private async loadVariantQuantity(variant: any) {
    const quantities = await this.dealVariantInventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.variantId = :variantId', { variantId: variant.id })
      .select('SUM(inventory.quantity)', 'total')
      .cache(true)
      .getRawOne()

    variant.remaining_quantity = Number.parseInt(quantities?.total || '0', 10)

    return variant
  }

  private async loadBuyNowData(dealId: string) {
    const dealWithVariants = await this.dealRepository
      .createQueryBuilder('deals')
      .where('deals.id = :dealId', { dealId })
      .leftJoin('deals.variants', 'variants')
      .leftJoin('variants.images', 'variants_images')
      .leftJoin('variants.option_values', 'option_values')
      .leftJoin('option_values.option', 'option')
      .select(['deals.id', 'variants', 'variants_images', 'option_values', 'option'])
      .cache(true)
      .getOne()

    const variantOptions = await this.transformVariantOptions(dealWithVariants?.variants || [])

    if (dealWithVariants?.variants) {
      await Promise.all(
        dealWithVariants.variants.map((variant) => this.loadVariantQuantity(variant)),
      )
    }

    return { variants: dealWithVariants?.variants || [], variantOptions }
  }

  private mergeAdditionalData(additionalData: any[]): any {
    const mergedData: any = {}

    additionalData.forEach((data) => {
      if (!data) return

      if (data.raffles) {
        mergedData.raffles = data.raffles
        mergedData.raffle_prizes = data.raffle_prizes
      }

      if (data.variants) {
        mergedData.variants = data.variants
        mergedData.variant_options = data.variantOptions
      }

      if (data.zones) {
        mergedData.shipping_profiles = data
      }
    })

    return mergedData
  }

  async execute(id: string, userId?: string, req?: Request): Promise<any> {
    try {
      const dealStatus = [DealStatus.ENDED, DealStatus.SCHEDULED, DealStatus.ON_DEAL]

      const results = await this.dealRepository
        .createQueryBuilder('deals')
        .where('deals.id = :id', { id })
        .andWhere('deals.status IN (:...dealStatus)', { dealStatus })
        .andWhere('"deals"."deal_access_date" <= CURRENT_DATE')
        .select([
          'deals.id id',
          'deals.name name',
          'deals.deal_type deal_type',
          'deals.donation_type donation_type',
          'deals.donation_amount donation_amount',
          'deals.start_date start_date',
          'deals.estimated_delivery_days estimated_delivery_days',
          'deals.end_date end_date',
          'deals.description description',
          'deals.deal_availability deal_availability',
          'deals.deal_access_date deal_access_date',
          'deals.item_condition item_condition',
          'deals.purchase_availability purchase_availability',
          'deals.shipping_covered_by shipping_covered_by',
          'deals.sender_location sender_location',
          'deals.currency currency',
          'deals.is_one_of_kind is_one_of_kind',
          'deals.starting_price starting_price',
          'deals.allow_reselling allow_reselling',
          'deals.reselling_amount_type reselling_amount_type',
          'deals.reselling_fee reselling_fee',
          'deals.reselling_cap reselling_cap',
          'deals.reselling_cap_value reselling_cap_value',
          'deals.status status',
          `(
            SELECT 
              ROUND(AVG("user_deal_review"."rating")::numeric, 1) 
            FROM 
              "user_deal_review" 
            WHERE 
              "user_deal_review"."dealId" = "deals"."id"
          ) AS "buynow_rate"`,

          `(
            SELECT 
              COALESCE(COUNT(*)::int, 0)
            FROM 
              "user_deal_review" 
            WHERE 
              "user_deal_review"."dealId" = "deals"."id"
              AND "user_deal_review"."status" IN ('${DealRatingStatus.ENABLED}', '${DealRatingStatus.REPORTED}')
          ) AS "buynow_review_count"`,

          `(
            SELECT 
              COALESCE(COUNT("user_deals_likes"."id")::int, 0)
            FROM 
              "user_deals_likes" 
            WHERE 
              "user_deals_likes"."dealId" = "deals"."id"
          ) AS "like_count"`,

          `(
            SELECT 
              COALESCE(COUNT("user_deals_shares"."id")::int, 0)
            FROM 
              "user_deals_shares" 
            WHERE 
              "user_deals_shares"."dealId" = "deals"."id"
          ) AS "share_count"`,

          `(
            SELECT 
              COALESCE(COUNT("bids"."id")::int, 0)
            FROM 
              "user_deal_bids" "bids" 
            WHERE 
              "bids"."dealId" = "deals"."id"
          ) AS "total_bids"`,

          `(
            SELECT 
              COALESCE(MAX("bids"."bid_amount")::int, 0)
            FROM 
              "user_deal_bids" "bids"
            WHERE 
              "bids"."dealId" = "deals"."id"
          ) AS "top_bid_amount"`,

          `(
            SELECT 
              COALESCE(COUNT(DISTINCT "item_payment"."senderId")::int, 0)
            FROM "user_deal_item_payment" "item_payment"
            WHERE 
              "item_payment"."dealId" = "deals"."id"
              AND "item_payment"."status" IN ('${PAYMENT_STATUS.DONATION_SETTLED}', '${PAYMENT_STATUS.COMPLETED}')
          ) AS "participants"`,

          // user joins
          `(
            SELECT 
              JSON_BUILD_OBJECT(
                'id', "user"."id",
                'username', "user"."username",
                'available_tokens', "user"."available_tokens",
                'prioritised_token', "user"."prioritised_token",
                'profile', JSON_BUILD_OBJECT(
                  'id', "profile"."id",
                  'introduction', "profile"."introduction",
                  'social_accounts', "profile"."social_accounts",
                  'profile_image', JSON_BUILD_OBJECT(
                    'id', "profile_images"."id",
                    'url', "profile_images"."url"
                  )
                )
              )
            FROM 
              "users" "user"
            LEFT JOIN "user_profiles" "profile" ON "profile"."userId" = "user"."id"
            LEFT JOIN "images" "profile_images" ON "profile_images"."id" = "profile"."profileImagesId"
            WHERE 
              "user"."id" = "deals"."userId"
          ) AS "user"`,

          // brand
          `(
            SELECT
              JSON_BUILD_OBJECT(
                'id', "brand"."id",
                'name', "brand"."name"
              )
            FROM "brands" "brand"
            WHERE "brand"."id" = "deals"."brandId"
          ) AS "brand"`,

          // category
          `(
            SELECT
              JSON_BUILD_OBJECT(
                'id', "category"."id",
                'name', "category"."name"
              )
            FROM "deal_categories" "category"
            WHERE "category"."id" = "deals"."categoryId"
          ) AS "category"`,

          // deals images
          `(
            SELECT 
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', "images"."id", 
                  'url', "images"."url", 
                  'is_featured', "images"."is_featured"
                )
              ) 
            FROM 
              "deals_images_images" "deals_images" 
              JOIN "images" "images" ON "images"."id" = "deals_images"."imagesId" 
            WHERE 
              "deals_images"."dealsId" = "deals"."id"
          ) AS "images"`,

          // donation
          `(
            SELECT
              JSON_BUILD_OBJECT(
                'id', "dp"."id",
                'name', "dp"."name",
                'goal_amount', "dp"."goal_amount",
                'description', "dp"."description"
              )
            FROM
              "donation_projects" "dp"
            WHERE "dp"."id" = "deals"."donationProjectId"
          ) as "donation_project"`,

          // nonprofit profile
          `(
            SELECT
              JSON_BUILD_OBJECT(
                'id', "nu"."id", 
                'profile', JSON_BUILD_OBJECT(
                    'id', "np"."id",
                    'first_name', "np"."first_name",
                    'last_name', "np"."last_name",
                    'foundation_name', "np"."foundation_name",
                    'foundation_url', "np"."foundation_url"
                  )
              )
            FROM
              "nonprofit_users" "nu"
            INNER JOIN "nonprofit_profiles" "np" ON "np"."userId" = "nu"."id"
            WHERE "nu"."id" = "deals"."donationNonprofitId"
          ) as "donation_nonprofit"`,

          // shipping
          `(
            SELECT
              JSON_AGG(
                JSON_BUILD_OBJECT(
                  'id', "fee"."id",
                  'min_amount', "fee"."min_amount", 
                  'max_amount', "fee"."max_amount", 
                  'fee', "fee"."fee"
                )
              )
            FROM "deal_shipping_fees" "fee" WHERE "fee"."dealId" = "deals"."id"
          ) AS "shipping_fee"`,
          'shipping_method.id shipping_method_id',
        ])
        .leftJoin('deals.shipping_method', 'shipping_method')
        .cache(true)
        .getRawOne()

      if (!results) {
        throw new NotFoundException(ErrorKey.DEAL_NOT_FOUND)
      }

      const additionalDataPromises: Promise<any>[] = []

      if (results.deal_type === DealType.RAFFLE) {
        additionalDataPromises.push(this.loadRaffleData(results.id))
      }

      if (results.deal_type === DealType.BUYNOW) {
        additionalDataPromises.push(this.loadBuyNowData(results.id))
      }

      if (!results.sender_location || !results.shipping_method) {
        additionalDataPromises.push(
          this.getShippingProfile(results.user.id, ShippingProfileStatus.ENABLED),
        )
      }

      const additionalData = await Promise.all(additionalDataPromises)
      const mergedExtra = this.mergeAdditionalData(additionalData)

      const enrichedResults = {
        ...results,
        ...mergedExtra,
      }

      if (userId) {
        this.eventEmitter.emit('reselling.event.track', {
          req,
          deal_id: id,
          user_id: userId,
          type: ResellingEventType.VIEW,
        })
      }

      return enrichedResults
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
