import { DateTime } from 'luxon'
import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetApplicableShippingPrice } from '@app/src/users/deal/buynow/helpers'
import { ShippingPriceConditionType } from '@app/src/users/shipping-profiles/enums'

export default async function (cart: any, userId: string): Promise<unknown> {
  try {
    const cartItemBuilder: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('cart', cart.id)
      .addRelation(Query.CART)
      .addRelation(Query.DEAL)
      .addRelation(Query.VARIANT)
      .useQuery(this.buynowCartItemRepository)
      .create()

    cartItemBuilder.condition.andWhere('"cart"."userId" = :userId', { userId })

    cartItemBuilder.condition.select([
      'data.id id',
      'data.total::float total',
      'data.quantity::int quantity',
      'data.gross_donations::float gross_donations',
      'data.net_donations::float net_donations',
      'data.delivery_date delivery_date',
      'data.delivery_time_slot delivery_time_slot',
      'data.shipping_price shipping_price',
      'data.estimated_delivery_days estimated_delivery_days',
      'data."shippingProfileId" shipping_profile',
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "dv"."id",
            'price', "dv"."price",
            'original_price', "dv"."original_price",
            'return_eligibility', "dv"."return_eligibility",
            'deal_id', "d"."id",
            'deal_name', "d"."name",
            'seller_id', "d"."userId",
            'option_values', (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                'id', "dov"."id",
                'value', "dov"."value",
                'label_name', "dov"."label_name",
                'option', JSON_BUILD_OBJECT(
                  'id', "do"."id",
                  'type', "do"."type"
                )
              )), '[]')
              FROM "deal_option_values" "dov"
              JOIN "deal_variants_option_values_deal_option_values" "dvov" ON "dvov"."dealOptionValuesId" = "dov"."id"
              LEFT JOIN "deal_options" "do" ON "do"."id" = "dov"."optionId"
              WHERE "dvov"."dealVariantsId" = "dv"."id"
            ),
            'images', (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
              FROM "deal_variants_images_images" "dvii"
              LEFT JOIN "images" "i" ON "i"."id" = "dvii"."imagesId"
              WHERE "dvii"."dealVariantsId" = "dv"."id"
            ),
            'product_tag', (
              SELECT JSON_BUILD_OBJECT(
                'name', "pts"."name",
                'days_range', "pts"."days_range",
                'date_range', "pts"."date_range",
                'is_disable_delivery_tag', "pts"."is_disable_delivery_tag"
              )
              FROM "product_tag_settings" "pts"
              WHERE "pts"."id" = "dv"."productTagId"
              AND "pts"."status" = 'ENABLED'
            )
          )
        FROM "deal_variants" "dv"
        LEFT JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "dv"."id" = "data"."variantId"::uuid
      ) AS "variant"`,
    ])

    const items = await cartItemBuilder.condition.getRawMany()

    if (!items.length) {
      throw new PreconditionFailedException(ErrorKey.INVALID_CART)
    }

    const groupedItems = {}

    for (const item of items) {
      const variant = item.variant.id
      const deal = item.variant.deal_id
      const seller = item.variant.seller_id
      const shippingProfileId = item.shipping_profile

      const itemWeight = await fetchItemWeight.bind(this)(variant)
      const shipping_price = await determineShippingPrice.bind(this)(
        item,
        seller,
        deal,
        variant,
        itemWeight,
      )
      const shipping_profile = await determineShippingProfile.bind(this)(seller, deal, variant)
      const itemDeliveryDate = await determineItemDeliveryDate.bind(this)(
        item,
        deal,
        variant,
        shippingProfileId ?? shipping_profile?.id,
      )

      if (!groupedItems[itemDeliveryDate.deliveryGroup]) {
        groupedItems[itemDeliveryDate.deliveryGroup] = []
      }

      // Check inventory and routing
      item.out_of_stock = false

      const orderRouting = await this.orderRoutingService.getRoutingForOrder(
        variant,
        seller,
        cart?.delivery_address?.id,
        item.quantity,
      )

      if (orderRouting && !orderRouting.applicableOrigins.length) {
        item.out_of_stock = true
      } else if (orderRouting?.applicableOrigins?.length > 0) {
        item.shipping_origins = orderRouting.applicableOrigins.map((originInfo) => ({
          originId: originInfo.origin.id,
          quantity: originInfo.quantity,
        }))
        // Create temporary reservations
        try {
          await this.inventoryService.reserveInventory(
            { id: item.id, variant: { id: variant } },
            seller,
            cart.delivery_address.id,
          )
        } catch (error) {
          console.error('Error reserving inventory:', error)
        }
      }

      groupedItems[itemDeliveryDate.deliveryGroup].push({
        ...item,
        shipping_price,
        delivery_settings: itemDeliveryDate.deliverySettings,
      })

      // Update the cart item entity if required fields are missing
      await updateCartItemIfNeeded.bind(this)(
        item,
        itemDeliveryDate,
        shipping_price,
        shipping_profile,
      )
    }

    return groupedItems
  } catch (error) {
    return HandleErrors(error)
  }
}

/**
 * Determine the delivery date for a cart item
 */
async function determineItemDeliveryDate(item, dealId, variantId, shippingProfileId) {
  // Fetch deal delivery days
  const dealDeliveryDays =
    await this.shippingProfileService.dealService.dealRepository.findOneOrFail({
      where: { id: dealId },
      select: ['estimated_delivery_days'],
    })

  // Fetch delivery settings
  const deliverySettings = await this.deliverySettingService.calculateDeliveryDate({
    variant: variantId,
  })

  let deliveryGroup
  let itemDeliveryDate

  // Helper function to construct the delivery group
  const constructDeliveryGroup = (baseDate, profileId) => {
    if (baseDate == null) {
      return profileId ? `${profileId}` : ''
    }

    return `${baseDate}${profileId ? ` - ${profileId}` : ''}`
  }

  // If item delivery date and time slot are already set, use them
  if (item.delivery_date && item.delivery_time_slot) {
    itemDeliveryDate = `${item.delivery_date} ${item.delivery_time_slot}`
    deliveryGroup = constructDeliveryGroup(item.delivery_date, shippingProfileId)
  }
  // If delivery settings provide a single date (non-array), use that
  else if (deliverySettings && !Array.isArray(deliverySettings.delivery_dates)) {
    itemDeliveryDate = deliverySettings.delivery_dates
    deliveryGroup = constructDeliveryGroup(itemDeliveryDate, shippingProfileId)
  }
  // If delivery settings provide an array of dates, use the first one
  else if (deliverySettings?.delivery_dates?.length) {
    const availableDeliveryDates = deliverySettings.delivery_dates
    const parsedDate = DateTime.fromISO(availableDeliveryDates[0])
    const formattedDate = parsedDate.toFormat('EEEE, MMMM d')

    itemDeliveryDate = availableDeliveryDates[0]
    deliveryGroup = constructDeliveryGroup(formattedDate, shippingProfileId)
  }
  // If no delivery settings are found, use the estimated delivery days
  else {
    itemDeliveryDate = `Item ships within ${dealDeliveryDays.estimated_delivery_days} days of your order`
    deliveryGroup = constructDeliveryGroup(itemDeliveryDate, shippingProfileId)
  }

  // Return the determined delivery date and other necessary data
  return {
    itemDeliveryDate,
    deliveryGroup,
    deliverySettings,
  }
}

// Fetch the item weight based on the variant
async function fetchItemWeight(variantId: string) {
  return this.entityManager.query(`
    SELECT * FROM "deal_option_values" "dov"
    WHERE "dov"."optionId" = (
      SELECT "id" FROM "deal_options" WHERE "type" = '${ShippingPriceConditionType.WEIGHT}'
    )
    AND "id" IN (
      SELECT "dealOptionValuesId"
      FROM "deal_variants_option_values_deal_option_values" "dvov"
      WHERE "dvov"."dealVariantsId" = '${variantId}'
    );`)
}

// Update cart item if necessary fields are missing
async function updateCartItemIfNeeded(item, itemDeliveryDate, shipping_price, shipping_profile) {
  const updatePayload: any = {}

  // Update delivery_date if it's missing
  if (!item.delivery_date) {
    updatePayload['delivery_date'] = itemDeliveryDate.itemDeliveryDate
  }

  // Update delivery_time_slot if it's missing
  if (
    !item.delivery_time_slot &&
    itemDeliveryDate?.deliverySettings?.delivery_carrier?.time_slot?.length
  ) {
    updatePayload['delivery_time_slot'] =
      itemDeliveryDate?.deliverySettings.delivery_carrier.time_slot[0]
  }

  // Extract and save estimated delivery days as an integer
  let estimatedDeliveryDays = null

  // If we have delivery settings with days_range, use the maximum value
  if (itemDeliveryDate?.deliverySettings?.days_range) {
    // Use the maximum value from the range as a conservative estimate
    estimatedDeliveryDays = parseInt(itemDeliveryDate.deliverySettings.days_range.max)
  }
  // If we have a specific delivery date string that contains estimated days
  else if (
    typeof itemDeliveryDate.itemDeliveryDate === 'string' &&
    itemDeliveryDate.itemDeliveryDate.includes('ships within')
  ) {
    // Extract the number from "Item ships within X days of your order"
    const daysMatch = itemDeliveryDate.itemDeliveryDate.match(/ships within (\d+) days/)
    if (daysMatch && daysMatch[1]) {
      estimatedDeliveryDays = parseInt(daysMatch[1])
    }
  }
  // If we have a specific delivery date, calculate days from now
  else if (
    itemDeliveryDate.itemDeliveryDate &&
    !itemDeliveryDate.itemDeliveryDate.includes('ships within')
  ) {
    try {
      // If it's an ISO date string
      if (DateTime.fromISO(itemDeliveryDate.itemDeliveryDate).isValid) {
        const deliveryDate = DateTime.fromISO(itemDeliveryDate.itemDeliveryDate)
        const now = DateTime.now()
        const daysDiff = Math.ceil(deliveryDate.diff(now, 'days').days)
        estimatedDeliveryDays = daysDiff > 0 ? daysDiff : 0
      }
    } catch (e) {
      // If parsing fails, don't update estimated days
      console.error('Error parsing delivery date:', e)
    }
  }

  // Add estimated delivery days to update payload if available
  if (estimatedDeliveryDays !== null) {
    updatePayload['estimated_delivery_days'] = estimatedDeliveryDays.toString()
  }

  await this.buynowCartItemRepository.update(item.id, {
    ...updatePayload,
    shipping_profile,
    shipping_price,
  })
}

// Determine the correct shipping price
async function determineShippingPrice(item, sellerId, dealId, variantId, itemWeight) {
  const shippingPriceResult = await this.shippingProfileService.applicableToDeal(
    sellerId,
    dealId,
    variantId,
    'price',
  )

  if (shippingPriceResult.data.length) {
    return GetApplicableShippingPrice(
      shippingPriceResult.data,
      itemWeight,
      Number.parseFloat(item.total),
      Number.parseInt(item.quantity),
    )
  }

  const shipping_fee = await this.entityManager.query(
    `SELECT * FROM "deal_shipping_fees" WHERE "dealId" = '${dealId}' ORDER BY "min_amount" ASC;`,
  )

  for (const fee of shipping_fee) {
    if (item.total >= fee.min_amount && (item.total <= fee.max_amount || !fee.max_amount)) {
      return fee.fee
    }
  }

  return 0
}

// Determine the shipping profile
async function determineShippingProfile(seller, deal, variant) {
  const shippingDetail = await this.shippingProfileService.applicableToDeal(
    seller,
    deal,
    variant,
    'shipping_profile',
  )

  return shippingDetail?.data?.length ? { id: shippingDetail.data[0] } : null
}
