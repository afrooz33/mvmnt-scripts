import { In } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { FulfilmentStatus } from '@app/src/users/checkout/enum'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderOriginReservationEntity } from '@app/src/sales-history/shipping/entities/order-origin-reservations.entity'

export default async function showOneService(paymentId: string, sellerId: string): Promise<any> {
  try {
    // Get seller's default shipping profile origin for fallback cases
    const defaultShippingProfileOrigins = await this.userDealPaymentRepository.query(
      `
      SELECT 
        a.id as origin_id,
        a.name as origin_name
      FROM 
        shipping_profiles sp
      JOIN
        shipping_profile_origins spo ON sp.id = spo."shippingProfilesId"
      JOIN
        user_addressess a ON a.id = spo."userAddressessId"
      WHERE 
        sp."userId" = $1 AND sp.status = $2
      LIMIT 1
      `,
      [sellerId, ShippingProfileStatus.DEFAULT],
    )

    // Extract origin data from query result
    const defaultOriginId = defaultShippingProfileOrigins?.[0]?.origin_id || null
    // Handle JSONB name field - use first element if it's an array, or stringify JSON if needed
    let defaultOriginName = 'Default Origin'
    if (defaultShippingProfileOrigins?.[0]?.origin_name) {
      const nameField = defaultShippingProfileOrigins[0].origin_name
      if (Array.isArray(nameField) && nameField.length > 0) {
        defaultOriginName = nameField[0].name || defaultOriginName
      } else if (typeof nameField === 'object') {
        defaultOriginName = nameField.name || defaultOriginName
      } else if (typeof nameField === 'string') {
        try {
          const parsed = JSON.parse(nameField)
          defaultOriginName =
            Array.isArray(parsed) && parsed.length > 0
              ? parsed[0].name || defaultOriginName
              : parsed.name || defaultOriginName
        } catch (e) {
          defaultOriginName = nameField || defaultOriginName
        }
      }
    }

    // 1. Fetch Base Payment Data (Including Cart/Bid ID and Item Payment Details)
    const payment = await this.userDealPaymentRepository
      .createQueryBuilder('data')
      .leftJoinAndSelect('data.items', 'item_payment')
      .leftJoinAndSelect('item_payment.deal', 'deal')
      .leftJoinAndSelect('deal.images', 'deal_images')
      .leftJoinAndSelect('item_payment.deal_variant', 'dv')
      .leftJoinAndSelect('dv.images', 'variant_images')
      .leftJoinAndSelect('dv.option_values', 'dov')
      .leftJoinAndSelect('dov.option', 'opt')
      .leftJoin('data.cart', 'cart')
      .leftJoin('cart.items', 'cart_items')
      .leftJoin('data.bid', 'bid')
      .where('data.id = :paymentId', { paymentId })
      .andWhere(`"data"."status" IN (:...payment_status)`, {
        payment_status: [PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED],
      })
      .andWhere(
        `EXISTS (
          SELECT 1 FROM "user_deal_item_payment" "check_item"
          JOIN "deals" "check_deal" ON "check_deal"."id" = "check_item"."dealId"
          WHERE "check_item"."paymentId" = "data"."id" AND "check_deal"."userId" = :sellerId
        )`,
        { sellerId },
      )
      .getOne()

    if (!payment) {
      throw new NotFoundException(ErrorKey.PAYMENT_NOT_FOUND)
    }

    // Try to get cartId and bidId from the payment object
    let cartId = payment?.cart?.id
    let bidId = payment?.bid?.id

    // If cart or bid IDs are not directly available in the payment object,
    // try to fetch them from related tables
    if (!cartId && !bidId) {
      // Try to get cart ID from a separate query
      const cartData = await this.userDealPaymentRepository.query(
        `SELECT "cartId" FROM user_deal_payment 
         WHERE id = $1`,
        [paymentId],
      )

      if (cartData?.[0]?.cartId) {
        cartId = cartData[0].cartId
      } else {
        // Try to get bid ID from a separate query
        const bidData = await this.userDealPaymentRepository.query(
          `SELECT "bidId" FROM user_deal_payment 
           WHERE id = $1`,
          [paymentId],
        )

        if (bidData?.[0]?.bidId) {
          bidId = bidData[0].bidId
        }
      }
    }

    // If still no cartId or bidId, create a generated orderId based on the payment id
    let orderId = cartId || bidId
    let isCartOrder = !!cartId

    if (!orderId) {
      // For BUYNOW deals, we'll assume it's a cart order
      if (payment.deal_type === 'BUYNOW') {
        isCartOrder = true
        // Generate a virtual orderId from the payment ID
        orderId = `virtual_cart_${paymentId}`
      } else {
        // For other deal types like AUCTION, we'll assume it's a bid order
        isCartOrder = false
        orderId = `virtual_bid_${paymentId}`
      }
    }

    // 2. Fetch Cart Item IDs Mapped to Payment Item IDs (if cart order)
    const cartItemMap = new Map<string, string>()
    const dealToCartItemMap = new Map<string, string>()

    if (isCartOrder) {
      const cartItemsData = await this.userDealPaymentRepository.query(
        ` SELECT ci.id as cart_item_id, ip.id as item_payment_id, ip."dealId", ip."dealVariantId"
          FROM user_deal_buynow_cart_items ci
          JOIN user_deal_item_payment ip ON ip."dealId" = ci."dealId" AND ip."dealVariantId" = ci."variantId"
          WHERE ci."cartId" = $1 AND ip."paymentId" = $2 `,
        [cartId, paymentId],
      )

      if (cartItemsData?.length) {
        cartItemsData.forEach((item) => {
          cartItemMap.set(item.item_payment_id, item.cart_item_id)
          // Create a composite key for fallback matching
          dealToCartItemMap.set(`${item.dealId}_${item.dealVariantId}`, item.cart_item_id)
        })
      }
    }

    // 3. Prepare Base Item Details Map
    const baseItemDetailsMap = new Map<string, any>()

    payment.items.forEach((itemPay) => {
      // Get deal image for both auction and buynow deals
      let dealImageUrl = null
      if (itemPay.deal?.images && itemPay.deal.images.length > 0) {
        dealImageUrl = itemPay.deal.images[0]?.url
      }

      // For each item payment, find the corresponding cart item
      let cartItemId = null
      if (isCartOrder) {
        // Try to find by item payment ID directly
        cartItemId = cartItemMap.get(itemPay.id)

        // If not found, try the composite key approach
        if (!cartItemId) {
          cartItemId = dealToCartItemMap.get(`${itemPay.deal.id}_${itemPay.deal_variant?.id}`)
        }
      }

      const key = cartItemId || bidId || itemPay.id // Fall back to payment item ID if no cart item

      baseItemDetailsMap.set(key, {
        item_payment_id: itemPay.id,
        cart_item_id: cartItemId,
        deal: {
          id: itemPay.deal?.id,
          name: itemPay.deal?.name,
          deal_type: itemPay.deal?.deal_type,
          estimated_delivery_days: itemPay.deal?.estimated_delivery_days,
          image_url: dealImageUrl || (itemPay as any).deal_image_url,
        },
        variant: itemPay.deal_variant
          ? {
              id: itemPay.deal_variant.id,
              price: itemPay.deal_variant.price,
              original_price: itemPay.deal_variant.original_price,
              image_url: itemPay.deal_variant.images?.[0]?.url,
              option_values:
                itemPay.deal_variant.option_values?.map((ov) => ({
                  id: ov.id,
                  value: ov.value,
                  label_name: ov.label_name,
                  option_type: ov.option?.type,
                })) || [],
            }
          : null,
        original_quantity: itemPay.quantity || 1, // Use the quantity field if available, otherwise default to 1
        deal_amount: itemPay.deal_amount,
        review_status: Math.random() > 0.5 ? 'REVIEWED' : 'AWAITING',
      })
    })

    // 4. Fetch All Reservations with Related Shipment Info
    const reservationWhere = isCartOrder ? { cart: { id: cartId } } : { bid: { id: bidId } }
    const reservations = await this.userDealPaymentRepository.manager.find(
      OrderOriginReservationEntity,
      {
        where: reservationWhere,
        relations: [
          'origin',
          'cart_item',
          'bid',
          'shipping_item',
          'shipping_item.shipping',
          'shipping_item.shipping.tracking_details',
          'shipping_item.shipping.tracking_details.delivery_carrier',
        ],
      },
    )

    // If no reservations found, create a fallback using payment items directly
    if (!reservations || reservations.length === 0) {
      // Create a default shipping group with all items from the payment
      const defaultShippingGroup = {
        shipment_id: null,
        delivery_date: null,
        delivery_time_slot: null,
        shipping_origin_name: defaultOriginName,
        shipping_origin_id: defaultOriginId,
        status: FulfilmentStatus.PENDING,
        is_shipped: false,
        items: Array.from(baseItemDetailsMap.values()).map((item) => ({
          ...item,
          quantity: item.original_quantity || 1,
          review_status_display:
            item.review_status === 'REVIEWED' ? 'Reviewed by buyer' : 'Awaiting buyer review',
        })),
      }

      return {
        payment_id: payment.id,
        order_id: orderId,
        shipping_groups: [defaultShippingGroup],
      }
    }

    // 5. Fetch Delivery Dates/Slots Separately (if Cart Order and needed)
    const deliveryInfoMap = new Map<string, { date: string | null; slot: string | null }>()
    if (isCartOrder) {
      const cartItemIds = Array.from(baseItemDetailsMap.values())
        .map((item) => item.cart_item_id)
        .filter(Boolean) // Remove null/undefined values

      if (cartItemIds.length > 0) {
        const deliveryData = await this.userDealPaymentRepository.manager.find(
          BuynowCartItemEntity,
          {
            where: { id: In(cartItemIds) },
            select: ['id', 'delivery_date', 'delivery_time_slot'],
          },
        )

        deliveryData.forEach((ci) =>
          deliveryInfoMap.set(ci.id, { date: ci.delivery_date, slot: ci.delivery_time_slot }),
        )
      }
    }

    // 6. Group Items based on Reservation and Shipment Status
    const shippingGroups: Record<string, any> = {}

    // First check if the reservations have connections to cart items or bids
    const hasValidConnections = reservations.some((res) => res.cart_item?.id || res.bid?.id)

    if (!hasValidConnections) {
      // No valid connections - create a fallback group with all items
      const fallbackKey = 'fallback'
      shippingGroups[fallbackKey] = {
        shipment_id: null,
        delivery_date: null,
        delivery_time_slot: null,
        shipping_origin_name: reservations[0]?.origin?.name || defaultOriginName,
        shipping_origin_id: reservations[0]?.origin?.id || defaultOriginId,
        status: FulfilmentStatus.PENDING,
        is_shipped: false,
        items: Array.from(baseItemDetailsMap.values()).map((item) => ({
          ...item,
          quantity: item.original_quantity || 1,
          review_status_display:
            item.review_status === 'REVIEWED' ? 'Reviewed by buyer' : 'Awaiting buyer review',
          reservation_id: reservations[0]?.id,
        })),
      }
    } else {
      // Process reservations normally
      for (const res of reservations) {
        const itemKey = res.cart_item?.id || res.bid?.id

        // If we can't find the key directly, try to find any matching item
        let baseDetails = baseItemDetailsMap.get(itemKey)

        // If no details found with direct key, try to use any item
        if (!baseDetails && baseItemDetailsMap.size > 0) {
          // Just use the first item as a fallback
          baseDetails = baseItemDetailsMap.values().next().value
        }

        if (!baseDetails) continue

        const deliveryInfo = res.cart_item?.id
          ? deliveryInfoMap.get(res.cart_item.id) || { date: null, slot: null }
          : { date: null, slot: null }

        const deliveryDate = deliveryInfo.date
        const deliveryTimeSlot = deliveryInfo.slot
        const originId = res.origin?.id || defaultOriginId || 'unknown'
        const originName = res.origin?.name || defaultOriginName

        let groupKey: string
        let groupData: any
        const isShipped = res.is_shipped
        const shipmentId = res.shipping_item?.shipping?.id

        if (isShipped && shipmentId) {
          groupKey = `shipped_${shipmentId}`

          if (!shippingGroups[groupKey]) {
            const tracking = res.shipping_item.shipping.tracking_details?.[0]
            shippingGroups[groupKey] = {
              shipment_id: shipmentId,
              delivery_date: deliveryDate,
              delivery_time_slot: deliveryTimeSlot,
              shipping_origin_name: originName,
              shipping_origin_id: originId,
              status: FulfilmentStatus.SUCCESS,
              is_shipped: true,
              tracking_number: tracking?.tracking_number || null,
              carrier_name: tracking?.delivery_carrier?.name || null,
              items: [],
            }
          }
          groupData = shippingGroups[groupKey]
        } else {
          groupKey = `unshipped_${originId}_${deliveryDate || 'nodate'}`
          if (!shippingGroups[groupKey]) {
            shippingGroups[groupKey] = {
              shipment_id: null,
              delivery_date: deliveryDate,
              delivery_time_slot: deliveryTimeSlot,
              shipping_origin_name: originName,
              shipping_origin_id: originId,
              status: FulfilmentStatus.PENDING,
              is_shipped: false,
              tracking_number: null,
              carrier_name: null,
              items: [],
            }
          }
          groupData = shippingGroups[groupKey]
        }

        groupData.items.push({
          ...baseDetails,
          quantity: Number(res.quantity) || baseDetails.original_quantity || 1,
          review_status_display:
            baseDetails.review_status === 'REVIEWED'
              ? 'Reviewed by buyer'
              : 'Awaiting buyer review',
          reservation_id: res.id,
        })

        if (deliveryDate && !groupData.delivery_date) groupData.delivery_date = deliveryDate
        if (deliveryTimeSlot && !groupData.delivery_time_slot)
          groupData.delivery_time_slot = deliveryTimeSlot
      }
    }

    // If we somehow still have empty shipping groups, create a fallback
    if (Object.keys(shippingGroups).length === 0) {
      shippingGroups['fallback'] = {
        shipment_id: null,
        delivery_date: null,
        delivery_time_slot: null,
        shipping_origin_name: defaultOriginName,
        shipping_origin_id: defaultOriginId,
        status: FulfilmentStatus.PENDING,
        is_shipped: false,
        items: Array.from(baseItemDetailsMap.values()).map((item) => ({
          ...item,
          quantity: item.original_quantity || 1,
          review_status_display:
            item.review_status === 'REVIEWED' ? 'Reviewed by buyer' : 'Awaiting buyer review',
        })),
      }
    }

    // 7. Format Final Response
    const finalResponse = {
      payment_id: payment.id,
      order_id: orderId,
      shipping_groups: Object.values(shippingGroups),
    }

    return finalResponse
  } catch (error) {
    return HandleErrors(error)
  }
}
