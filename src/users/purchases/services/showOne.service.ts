import { In } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { ShippingStatus } from '@app/src/sales-history/shipping/enums'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { CancellationStatus } from '@app/src/purchase-history/cancel-order/enums'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import {
  ReturnExchangeType,
  ReturnExchangeStatus,
  ReturnShippingFeeResponsibility,
} from '@app/src/purchase-history/refund-exchange/enums'
import {
  PurchaseItem,
  ActionButton,
  PurchaseContext,
  PurchaseItemGroup,
  PurchaseDetailsDependencies,
} from '@app/src/users/purchases/interfaces'

async function fetchBasePurchaseInfo(
  id: string,
  userId: string, // ID of the user VIEWING the history
  dependencies: PurchaseDetailsDependencies,
): Promise<UserDealPaymentEntity> {
  const { userDealPaymentRepository } = dependencies

  const purchase = await userDealPaymentRepository.findOne({
    where: [
      {
        id: id,
        user: { id: userId },
        status: In([PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED]),
      },
      {
        id: id,
        cart: { wishlist: { user: { id: userId } } },
        status: In([PAYMENT_STATUS.COMPLETED, PAYMENT_STATUS.DONATION_SETTLED]),
      },
    ],
    relations: [
      'user',
      'cart',
      'cart.wishlist',
      'cart.wishlist.user',
      'cart.delivery_address',
      'cart.delivery_address.country',
      'cart.delivery_address.postcode',
      'raffle_purchase',
      'bid',
      'bid.address',
      'bid.address.country',
      'bid.address.postcode',
    ],
    select: {
      id: true,
      deal_type: true,
      status: true,
      user: { id: true },
      cart: {
        id: true,
        delivery_address: {
          id: true,
          phone_number: true,
          street: true,
          building: true,
          city: true,
          state: true,
          country: { id: true, name: true },
          postcode: { id: true, postcode: true },
          is_default: true,
          status: true,
        },
        wishlist: { id: true, user: { id: true } },
      },
      raffle_purchase: { id: true },
      bid: {
        id: true,
        address: {
          id: true,
          phone_number: true,
          street: true,
          building: true,
          city: true,
          state: true,
          country: { id: true, name: true },
          postcode: { id: true, postcode: true },
          is_default: true,
          status: true,
        },
      },
    },
  })

  if (!purchase) {
    throw new NotFoundException(ErrorKey.PURCHASE_NOT_FOUND)
  }

  const isBuyer = purchase.user?.id === userId
  const isRecipient = purchase.cart?.wishlist?.user?.id === userId

  if (!isBuyer && !isRecipient) {
    throw new NotFoundException(ErrorKey.PURCHASE_NOT_FOUND)
  }

  return purchase
}

async function determinePurchaseContext(
  purchase: UserDealPaymentEntity,
  userId: string,
  userRole: 'buyer' | 'recipient',
  dependencies?: PurchaseDetailsDependencies,
): Promise<PurchaseContext> {
  let isWishlist = false

  if (purchase.cart?.wishlist?.id) {
    isWishlist = true
  } else if (purchase.cart?.id && dependencies?.cartRepository) {
    try {
      const cart = await dependencies.cartRepository.findOne({
        where: { id: purchase.cart.id },
        relations: ['wishlist'],
      })
      isWishlist = !!cart?.wishlist
    } catch (error) {
      console.error('Error checking cart for wishlist:', error)
      isWishlist = false
    }
  }

  const isRecipient = isWishlist && userRole === 'recipient'
  const isSender = isWishlist && userRole === 'buyer'

  return { userId, userRole, isWishlist, isRecipient, isSender }
}

async function fetchAuctionPurchaseDetail(
  bidId: string,
  userId: string,
  dependencies: PurchaseDetailsDependencies,
): Promise<any> {
  const { dataSource } = dependencies

  const query = `
    SELECT
      b.id,
      b.status,
      b.quantity,
      b.bid_amount,
      b.total_amount,
      b.delivery_date,
      b.delivery_time_slot,
      d.id AS deal_id,
      d.name AS deal_name,
      d.deal_type,
      d.estimated_delivery_days,
      ${GetDealFirstImageQuery('d.deal_type', 'd.id')},
      (SELECT json_build_object(
        'id', os.id,
        'status', os.status,
        'tracking_details', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', ost.id,
              'tracking_number', ost.tracking_number,
              'delivery_carrier', dc.name
            )
          ), '[]')
          FROM order_shipping_tracking ost
          JOIN "delivery_carrier" dc ON dc."id" = ost."deliveryCarrierId"
          WHERE ost."shippingId" = os.id
        ),
        'is_shipped', (os.status = '${ShippingStatus.SHIPPED}' OR os.status = '${
          ShippingStatus.DELIVERED
        }' OR os.status = '${ShippingStatus.PARTIALLY_SHIPPED}')
      ) FROM order_shippings os WHERE os."bidId" = b.id LIMIT 1) AS shipping_info,
      (SELECT json_build_object(
        'id', ore.id,
        'type', ore.type,
        'status', ore.status,
        'requested_at', ore.requested_at,
        'is_wishlist_gift', ore.is_wishlist_gift,
        'shipping_fee_responsibility', ore.shipping_fee_responsibility,
        'items', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', orei.id,
              'status', orei.status,
              'reason', orei.reason,
              'quantity_requested', orei.quantity_requested,
              'approved_quantity', orei.approved_quantity,
              'shipped_quantity', orei.shipped_quantity,
              'approved_at', orei.approved_at,
              'rejected_at', orei.rejected_at,
              'shipments', (
                SELECT COALESCE(json_agg(
                  json_build_object(
                    'id', rs.id,
                    'tracking_number', rs.tracking_number,
                    'delivery_carrier', dc.name,
                    'shipped_at', rs.shipped_at
                  )
                ), '[]')
                FROM order_return_shipments rs
                JOIN "delivery_carrier" dc ON dc."id" = rs."deliveryCarrierId"
                WHERE rs."returnExchangeItemId" = orei.id
              )
            )
          ), '[]')
          FROM order_return_exchange_items orei
          WHERE orei."returnExchangeId" = ore.id AND orei."bidId" = b.id
        )
      ) FROM order_return_exchange ore WHERE ore."bidId" = b.id ORDER BY ore.created DESC LIMIT 1) AS return_exchange_info,
      (SELECT json_build_object(
        'id', oc.id,
        'status', oc.status,
        'requested_at', oc.requested_at,
        'approved_at', oc.approved_at,
        'rejected_at', oc.rejected_at,
        'refunded_at', oc.refunded_at
      ) FROM order_cancellations oc WHERE oc."bidId" = b.id ORDER BY oc.created DESC LIMIT 1) AS cancellation_info,
      (EXISTS (
        SELECT 1 FROM user_deal_review dr
        WHERE dr."dealId" = d.id AND dr."userId" = $2
      )) AS has_review
    FROM user_deal_bids b
    JOIN deals d ON b."dealId" = d.id
    WHERE b.id = $1
  `

  const result = await dataSource.query(query, [bidId, userId])
  return result[0] || null
}

async function fetchBuyNowPurchaseDetails(
  cartId: string,
  userId: string,
  dependencies: PurchaseDetailsDependencies,
): Promise<any[]> {
  const { dataSource } = dependencies

  const query = `
    SELECT
      ci.id,
      ci."cartId",
      ci.total::float,
      ci.quantity::int,
      ci.delivery_date,
      ci.delivery_time_slot,
      ci."shippingProfileId" AS shipping_profile,
      d.id AS deal_id,
      d.name AS deal_name,
      d.deal_type,
      d.estimated_delivery_days,
      d.return_eligibility,
      ${GetDealFirstImageQuery('d.deal_type', 'd.id')},
      (
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
            )
          )
        FROM "deal_variants" "dv"
        LEFT JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "dv"."id" = "ci"."variantId"::uuid
      ) AS "variant",
      (EXISTS (
        SELECT 1
        FROM "order_shipping_items" osi
        JOIN "order_shippings" os ON os.id = osi."shippingId"
        WHERE os."cartId" = ci."cartId"
        AND osi."cartItemId" = ci.id
        AND osi.shipped_at IS NOT NULL
      )) AS is_shipped_item,
      (SELECT json_build_object(
        'id', os.id,
        'status', os.status,
        'tracking_details', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', ost.id,
              'tracking_number', ost.tracking_number,
              'delivery_carrier', dc.name
            )
          ), '[]')
          FROM "order_shipping_tracking" ost
          JOIN "delivery_carrier" dc ON dc."id" = ost."deliveryCarrierId"
          WHERE ost."shippingId" = os.id
        ),
        'is_shipped', (os.status = '${ShippingStatus.SHIPPED}' OR os.status = '${
          ShippingStatus.DELIVERED
        }' OR os.status = '${ShippingStatus.PARTIALLY_SHIPPED}')
      ) FROM "order_shippings" os WHERE os."cartId" = ci."cartId" LIMIT 1) AS shipping_info,
      (SELECT json_build_object(
        'id', ore.id,
        'type', ore.type,
        'status', ore.status,
        'requested_at', ore.requested_at,
        'is_wishlist_gift', ore.is_wishlist_gift,
        'shipping_fee_responsibility', ore.shipping_fee_responsibility,
        'cart_items', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', orei.id,
              'status', orei.status,
              'reason', orei.reason,
              'quantity_requested', orei.quantity_requested,
              'approved_quantity', orei.approved_quantity,
              'shipped_quantity', orei.shipped_quantity,
              'approved_at', orei.approved_at,
              'rejected_at', orei.rejected_at,
              'cart_item_id', orei."cartItemId",
              'shipments', (
                SELECT COALESCE(json_agg(
                  json_build_object(
                    'id', rs.id,
                    'tracking_number', rs.tracking_number,
                    'delivery_carrier', dc.name,
                    'shipped_at', rs.shipped_at
                  )
                ), '[]')
                FROM "order_return_shipments" rs
                JOIN "delivery_carrier" dc ON dc."id" = rs."deliveryCarrierId"
                WHERE rs."returnExchangeItemId" = orei.id
              )
            )
          ), '[]')
          FROM "order_return_exchange_items" orei
          WHERE orei."returnExchangeId" = ore.id
        )
      ) FROM "order_return_exchange" ore WHERE ore."cartId" = ci."cartId" ORDER BY ore.created DESC LIMIT 1) AS return_exchange_info,

      (SELECT json_build_object(
        'id', oc.id,
        'status', oc.status,
        'requested_at', oc.requested_at,
        'approved_at', oc.approved_at,
        'rejected_at', oc.rejected_at,
        'refunded_at', oc.refunded_at,
        'cart_items', (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', oci.id,
              'status', oci.status,
              'reason', oci.reason,
              'quantity_to_cancel', oci.quantity_to_cancel,
              'cart_item_id', oci."cartItemId"
            )
          ), '[]')
          FROM "order_cancellation_items" oci
          WHERE oci."cancellationId" = oc.id
        )
      ) FROM "order_cancellations" oc WHERE oc."cartId" = ci."cartId" ORDER BY oc.created DESC LIMIT 1) AS cancellation_info,
      (SELECT CASE WHEN "c"."wishlistId" IS NOT NULL THEN true ELSE false END
       FROM "user_deal_buynow_cart" "c"
       WHERE c.id = ci."cartId") AS is_wishlist_purchase,
       (EXISTS (
         SELECT 1 FROM user_deal_review dr
         WHERE dr."dealId" = d.id AND dr."userId" = $2
       )) AS has_review
    FROM "user_deal_buynow_cart_items" ci
    JOIN deals d ON ci."dealId" = d.id
    WHERE ci."cartId" = $1
  `

  const result = await dataSource.query(query, [cartId, userId])
  return result || []
}

async function fetchRafflePurchaseDetails(
  rafflePurchaseId: string,
  dependencies: PurchaseDetailsDependencies,
): Promise<any[]> {
  const { rafflePurchaseRepository } = dependencies

  const select = [
    'data.id id',
    'deal.id deal_id',
    'deal.name deal_name',
    'deal.deal_type deal_type',
    `${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')}`,
    'data.quantity quantity',
    'data.total_amount total_amount',
    'data.status status',
  ]

  const items = await rafflePurchaseRepository
    .createQueryBuilder('data')
    .leftJoin('data.deal', 'deal')
    .where('"data"."id" = :id', { id: rafflePurchaseId })
    .select(select)
    .getRawMany()

  return items.map((item) => ({
    ...item,
    deal_type: DealType.RAFFLE,
    rafflePurchaseId: item.id,
    has_review: false, // Raffles likely not reviewable
    return_exchange_info: null,
  }))
}

function isExchangeShipment(shipment: any, returnItem: any): boolean {
  if (!shipment || !returnItem) return false

  if (returnItem.approved_at && shipment.shipped_at) {
    const approvedDate = new Date(returnItem.approved_at).getTime()
    const shippedDate = new Date(shipment.shipped_at).getTime()

    if (shippedDate > approvedDate) {
      const hasReturnShipment = returnItem.shipments?.some(
        (s) => s.id !== shipment.id && new Date(s.shipped_at).getTime() < shippedDate,
      )

      return hasReturnShipment || returnItem.status === ReturnExchangeStatus.EXCHANGE_SHIPPED
    }
  }

  return false
}

function processAuctionStatus(
  item: any,
  context: PurchaseContext,
): {
  statusText: string
  statusDate: Date | string
  groupActions: ActionButton[]
  itemNeedsReview: boolean
} {
  const result = {
    statusText: '',
    statusDate: null as Date | string,
    groupActions: [] as ActionButton[],
  }
  let itemNeedsReview = false

  const isShipped = item.shipping_info?.is_shipped || false
  let cancelReturnOverride = false
  let returnActionEnabled = true

  if (item.shipping_info && item.shipping_info.tracking_details?.length > 0) {
    result.groupActions.push({
      text: 'Track package',
      action: 'trackPackage',
      enabled: true,
    })
  }

  if (item.cancellation_info) {
    const c = item.cancellation_info
    if (c.status === CancellationStatus.REQUESTED) {
      result.statusText = 'Cancellation requested'
      result.statusDate = c.requested_at
      result.groupActions.push({
        text: 'Check cancel status',
        action: 'checkCancelStatus',
        enabled: true,
      })
      cancelReturnOverride = true
      returnActionEnabled = false
    } else if (c.status === CancellationStatus.APPROVED) {
      result.statusText = 'Order cancelled'
      result.statusDate = c.approved_at
      result.groupActions.push(
        { text: 'Check cancel status', action: 'checkCancelStatus', enabled: true },
        { text: 'Check refund', action: 'checkRefund', enabled: true },
      )
      cancelReturnOverride = true
      returnActionEnabled = false
    } else if (c.status === CancellationStatus.REJECTED) {
      result.statusText = 'Order cancellation declined'
      result.statusDate = c.rejected_at
      result.groupActions.push({
        text: 'Check cancel status',
        action: 'checkCancelStatus',
        enabled: true,
      })
    }
  }

  if (
    !cancelReturnOverride &&
    item.return_exchange_info &&
    item.return_exchange_info.items?.length > 0
  ) {
    cancelReturnOverride = true
    const re = item.return_exchange_info
    const returnItem = re.items[0]

    let shipActionText = 'Ship return item'
    if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.BUYER) {
      shipActionText = 'Ship with pre-paid postage'
    } else if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.SELLER) {
      shipActionText = 'Ship with cash on delivery'
    }

    if (re.type === ReturnExchangeType.EXCHANGE) {
      if (returnItem.status === ReturnExchangeStatus.REQUESTED) {
        result.statusText = 'Exchange requested'
        result.statusDate = re.requested_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      } else if (
        returnItem.status === ReturnExchangeStatus.APPROVED ||
        returnItem.status === ReturnExchangeStatus.PARTIALLY_APPROVED
      ) {
        result.statusText = 'Return process start date'
        result.statusDate = returnItem.approved_at
        result.groupActions.push({ text: shipActionText, action: 'shipReturnItem', enabled: true })
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      } else if (returnItem.status === ReturnExchangeStatus.SHIPPED) {
        const shipment = returnItem.shipments?.[0]
        result.statusText = 'Return shipped date'
        result.statusDate = shipment?.shipped_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      } else if (returnItem.status === ReturnExchangeStatus.EXCHANGE_SHIPPED) {
        let exchangeShipment = null
        if (returnItem.shipments?.length > 0) {
          const sorted = [...returnItem.shipments].sort(
            (a, b) => new Date(b.shipped_at).getTime() - new Date(a.shipped_at).getTime(),
          )
          if (sorted[0] && isExchangeShipment(sorted[0], returnItem)) {
            exchangeShipment = sorted[0]
          }
        }
        result.statusText = 'Exchange item shipping date'
        result.statusDate = exchangeShipment?.shipped_at || returnItem.approved_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = true
      } else if (returnItem.status === ReturnExchangeStatus.COMPLETED) {
        result.statusText = 'Exchange completed'
        result.statusDate = returnItem.approved_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = true
      } else if (returnItem.status === ReturnExchangeStatus.REJECTED) {
        result.statusText = 'Exchange declined'
        result.statusDate = returnItem.rejected_at
        result.groupActions.push({
          text: 'Re-request return',
          action: 'reRequestReturn',
          enabled: true,
        })
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      }
    } else if (re.type === ReturnExchangeType.RETURN || re.type === ReturnExchangeType.REFUND) {
      if (returnItem.status === ReturnExchangeStatus.REQUESTED) {
        result.statusText = 'Return requested'
        result.statusDate = re.requested_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      } else if (
        returnItem.status === ReturnExchangeStatus.APPROVED ||
        returnItem.status === ReturnExchangeStatus.PARTIALLY_APPROVED
      ) {
        result.statusText = 'Return process start date'
        result.statusDate = returnItem.approved_at
        result.groupActions.push({ text: shipActionText, action: 'shipReturnItem', enabled: true })
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      } else if (returnItem.status === ReturnExchangeStatus.SHIPPED) {
        const shipment = returnItem.shipments?.[0]
        result.statusText = 'Return shipped date'
        result.statusDate = shipment?.shipped_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = false
      } else if (
        returnItem.status === ReturnExchangeStatus.COMPLETED ||
        returnItem.status === ReturnExchangeStatus.REFUNDED
      ) {
        result.statusText = 'Refunded date'
        result.statusDate = returnItem.approved_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = true
      } else if (returnItem.status === ReturnExchangeStatus.REJECTED) {
        result.statusText = 'Return request denied'
        result.statusDate = returnItem.rejected_at
        result.groupActions.push({
          text: 'Check return status',
          action: 'checkReturnStatus',
          enabled: true,
        })
        returnActionEnabled = true
      }
    }
  }

  if (!cancelReturnOverride) {
    const estimatedDays = item.estimated_delivery_days || '1-2'
    result.statusText = `Shipping date: Item ships within ${estimatedDays} days of your order`
    result.statusDate = null
  }

  if (isShipped && returnActionEnabled) {
    result.groupActions.push({ text: 'Request return', action: 'requestReturn', enabled: true })
  }

  if (!context.isWishlist) {
    const canReview = isShipped && returnActionEnabled
    itemNeedsReview = !item.has_review && canReview
  }

  return { ...result, itemNeedsReview }
}

function processBuyNowStatus(
  item: any,
  context: PurchaseContext,
): {
  statusText: string
  statusDate: Date | string
  groupActions: ActionButton[]
  itemNeedsReview: boolean
} {
  const { isWishlist, isRecipient } = context
  const result = {
    statusText: '',
    statusDate: null as Date | string,
    groupActions: [] as ActionButton[],
  }
  let itemNeedsReview = false

  const isShipped = item.is_shipped_item || false
  let cancelReturnOverride = false
  let returnActionEnabled = true

  if (item.shipping_info && item.shipping_info.tracking_details?.length > 0) {
    result.groupActions.push({ text: 'Track package', action: 'trackPackage', enabled: true })
  }

  if (isWishlist && isRecipient) {
    const recipientResult = processWishlistRecipientGroupStatus(item)
    result.statusText = recipientResult.statusText
    result.statusDate = recipientResult.statusDate
    result.groupActions = recipientResult.groupActions
    return { ...result, itemNeedsReview }
  }

  if (item.cancellation_info) {
    const c = item.cancellation_info
    const cancelItem = c.cart_items?.find((ci) => ci.cart_item_id === item.id)
    if (cancelItem) {
      if (c.status === CancellationStatus.REQUESTED) {
        result.statusText = 'Cancellation requested'
        result.statusDate = c.requested_at
        result.groupActions.push({
          text: 'Check cancel status',
          action: 'checkCancelStatus',
          enabled: true,
        })
        cancelReturnOverride = true
        returnActionEnabled = false
      } else if (c.status === CancellationStatus.APPROVED) {
        result.statusText = 'Order cancelled'
        result.statusDate = c.approved_at
        result.groupActions.push(
          { text: 'Check cancel status', action: 'checkCancelStatus', enabled: true },
          { text: 'Check refund', action: 'checkRefund', enabled: true },
        )
        cancelReturnOverride = true
        returnActionEnabled = false
      } else if (c.status === CancellationStatus.REJECTED) {
        result.statusText = 'Order cancellation declined'
        result.statusDate = c.rejected_at
        result.groupActions.push({
          text: 'Check cancel status',
          action: 'checkCancelStatus',
          enabled: true,
        })
      }
    }
  }

  if (!cancelReturnOverride && item.return_exchange_info) {
    const re = item.return_exchange_info
    const returnItem = re.cart_items?.find((ci) => ci.cart_item_id === item.id)
    if (returnItem) {
      cancelReturnOverride = true

      let shipActionText = 'Ship return item'
      if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.BUYER) {
        shipActionText = 'Ship with pre-paid postage'
      } else if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.SELLER) {
        shipActionText = 'Ship with cash on delivery'
      }

      if (re.type === ReturnExchangeType.EXCHANGE) {
        if (returnItem.status === ReturnExchangeStatus.REQUESTED) {
          result.statusText = 'Exchange requested'
          result.statusDate = re.requested_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        } else if (
          returnItem.status === ReturnExchangeStatus.APPROVED ||
          returnItem.status === ReturnExchangeStatus.PARTIALLY_APPROVED
        ) {
          result.statusText = 'Return process start date'
          result.statusDate = returnItem.approved_at
          result.groupActions.push({
            text: shipActionText,
            action: 'shipReturnItem',
            enabled: true,
          })
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        } else if (returnItem.status === ReturnExchangeStatus.SHIPPED) {
          const shipment = returnItem.shipments?.[0]
          result.statusText = 'Return shipped date'
          result.statusDate = shipment?.shipped_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        } else if (returnItem.status === ReturnExchangeStatus.EXCHANGE_SHIPPED) {
          let exchangeShipment = null
          if (returnItem.shipments?.length > 0) {
            const sorted = [...returnItem.shipments].sort(
              (a, b) => new Date(b.shipped_at).getTime() - new Date(a.shipped_at).getTime(),
            )
            if (sorted[0] && isExchangeShipment(sorted[0], returnItem)) {
              exchangeShipment = sorted[0]
            }
          }
          result.statusText = 'Exchange item shipping date'
          result.statusDate = exchangeShipment?.shipped_at || returnItem.approved_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = true
        } else if (returnItem.status === ReturnExchangeStatus.COMPLETED) {
          result.statusText = 'Exchange completed'
          result.statusDate = returnItem.approved_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = true
        } else if (returnItem.status === ReturnExchangeStatus.REJECTED) {
          result.statusText = 'Exchange declined'
          result.statusDate = returnItem.rejected_at
          result.groupActions.push({
            text: 'Re-request return',
            action: 'reRequestReturn',
            enabled: true,
          })
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        }
      } else if (re.type === ReturnExchangeType.RETURN || re.type === ReturnExchangeType.REFUND) {
        if (returnItem.status === ReturnExchangeStatus.REQUESTED) {
          result.statusText = 'Return requested'
          result.statusDate = re.requested_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        } else if (
          returnItem.status === ReturnExchangeStatus.APPROVED ||
          returnItem.status === ReturnExchangeStatus.PARTIALLY_APPROVED
        ) {
          result.statusText = 'Return process start date'
          result.statusDate = returnItem.approved_at
          result.groupActions.push({
            text: shipActionText,
            action: 'shipReturnItem',
            enabled: true,
          })
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        } else if (returnItem.status === ReturnExchangeStatus.SHIPPED) {
          const shipment = returnItem.shipments?.[0]
          result.statusText = 'Return shipped date'
          result.statusDate = shipment?.shipped_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = false
        } else if (
          returnItem.status === ReturnExchangeStatus.COMPLETED ||
          returnItem.status === ReturnExchangeStatus.REFUNDED
        ) {
          result.statusText = 'Refunded date'
          result.statusDate = returnItem.approved_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = true
        } else if (returnItem.status === ReturnExchangeStatus.REJECTED) {
          result.statusText = 'Return request denied'
          result.statusDate = returnItem.rejected_at
          result.groupActions.push({
            text: 'Check return status',
            action: 'checkReturnStatus',
            enabled: true,
          })
          returnActionEnabled = true
        }
      }
    }
  }

  if (!cancelReturnOverride) {
    if (item.delivery_date) {
      result.statusText = 'Delivery date'
      result.statusDate = item.delivery_date
    } else {
      const days = item.estimated_delivery_days || '1-2'
      result.statusText = `Shipping date: Item ships within ${days} days of your order`
      result.statusDate = null
    }
  }

  if (!isShipped && !isWishlist && !cancelReturnOverride) {
    result.groupActions.push({ text: 'Cancel order', action: 'cancelOrder', enabled: true })
  } else if (isShipped && !isWishlist && returnActionEnabled) {
    result.groupActions.push({ text: 'Request return', action: 'requestReturn', enabled: true })
  }

  if (!isWishlist) {
    const canReview = isShipped && returnActionEnabled
    itemNeedsReview = !item.has_review && canReview
  }

  return { ...result, itemNeedsReview }
}

function processWishlistRecipientGroupStatus(item: any): {
  statusText: string
  statusDate: Date | string
  groupActions: ActionButton[]
} {
  const result = {
    statusText: '',
    statusDate: null as Date | string,
    groupActions: [] as ActionButton[],
  }

  const isShipped = item.is_shipped_item || false

  if (item.shipping_info && item.shipping_info.tracking_details?.length > 0) {
    result.groupActions.push({
      text: 'Track package',
      action: 'trackPackage',
      enabled: true,
    })
  }

  let exchangeActionEnabled = true
  if (item.return_exchange_info) {
    const re = item.return_exchange_info
    if (re.is_wishlist_gift && re.type === ReturnExchangeType.EXCHANGE) {
      const returnItem = re.cart_items?.find((ci) => ci.cart_item_id === item.id)
      if (returnItem) {
        let shipActionText = 'Ship return item'
        if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.BUYER) {
          shipActionText = 'Ship with pre-paid postage'
        } else if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.SELLER) {
          shipActionText = 'Ship with cash on delivery'
        }

        if (returnItem.status === ReturnExchangeStatus.REQUESTED) {
          result.statusText = 'Exchange requested'
          result.statusDate = re.requested_at
          result.groupActions.push({
            text: 'Check exchange status',
            action: 'checkExchangeStatus',
            enabled: true,
          })
          exchangeActionEnabled = false
        } else if (
          returnItem.status === ReturnExchangeStatus.APPROVED ||
          returnItem.status === ReturnExchangeStatus.PARTIALLY_APPROVED
        ) {
          result.statusText = 'Return process start date'
          result.statusDate = returnItem.approved_at
          if (re.shipping_fee_responsibility === ReturnShippingFeeResponsibility.BUYER) {
            result.groupActions.push({
              text: shipActionText,
              action: 'shipReturnItem',
              enabled: true,
            })
          }
          result.groupActions.push({
            text: 'Check exchange status',
            action: 'checkExchangeStatus',
            enabled: true,
          })
          exchangeActionEnabled = false
        } else if (returnItem.status === ReturnExchangeStatus.SHIPPED) {
          const shipment = returnItem.shipments?.[0]
          result.statusText = 'Return shipped date'
          result.statusDate = shipment?.shipped_at
          result.groupActions.push({
            text: 'Check exchange status',
            action: 'checkExchangeStatus',
            enabled: true,
          })
          exchangeActionEnabled = false
        } else if (returnItem.status === ReturnExchangeStatus.EXCHANGE_SHIPPED) {
          let exchangeShipment = null
          if (returnItem.shipments?.length > 0) {
            const sorted = [...returnItem.shipments].sort(
              (a, b) => new Date(b.shipped_at).getTime() - new Date(a.shipped_at).getTime(),
            )
            if (sorted[0] && isExchangeShipment(sorted[0], returnItem)) {
              exchangeShipment = sorted[0]
            }
          }
          result.statusText = 'Exchange item shipping date'
          result.statusDate = exchangeShipment?.shipped_at || returnItem.approved_at
          result.groupActions.push({
            text: 'Check exchange status',
            action: 'checkExchangeStatus',
            enabled: true,
          })
          exchangeActionEnabled = true
        } else if (returnItem.status === ReturnExchangeStatus.COMPLETED) {
          result.statusText = 'Exchange completed'
          result.statusDate = returnItem.approved_at
          result.groupActions.push({
            text: 'Check exchange status',
            action: 'checkExchangeStatus',
            enabled: true,
          })
          exchangeActionEnabled = true
        } else if (returnItem.status === ReturnExchangeStatus.REJECTED) {
          result.statusText = 'Exchange request declined'
          result.statusDate = returnItem.rejected_at
          result.groupActions.push({
            text: 'Re-request exchange',
            action: 'reRequestExchange',
            enabled: true,
          })
          result.groupActions.push({
            text: 'Check exchange status',
            action: 'checkExchangeStatus',
            enabled: true,
          })
          exchangeActionEnabled = false
        }
      }
    }
  }

  if (!result.statusText) {
    if (item.delivery_date) {
      result.statusText = 'Delivery date'
      result.statusDate = item.delivery_date
    } else {
      const days = item.estimated_delivery_days || '1-2'
      result.statusText = `Shipping date: Item ships within ${days} days of your order`
      result.statusDate = null
    }
  }

  if (isShipped && exchangeActionEnabled) {
    result.groupActions.push({ text: 'Request exchange', action: 'requestExchange', enabled: true })
  }

  return result
}

function calculateGroupKey(item: any): string {
  let groupKey = ''

  if (
    item.cancellation_info &&
    item.cancellation_info.cart_items?.some((ci) => ci.cart_item_id === item.id)
  ) {
    const c = item.cancellation_info
    groupKey = `cancel_${c.status}_${item.cartId}`
  } else if (
    item.return_exchange_info &&
    item.return_exchange_info.cart_items?.some((ci) => ci.cart_item_id === item.id)
  ) {
    const re = item.return_exchange_info
    const returnItem = re.cart_items.find((ci) => ci.cart_item_id === item.id)
    groupKey = `return_${re.type}_${returnItem.status}_${returnItem.id}`
  } else if (item.delivery_date) {
    const isShipped = item.is_shipped_item || false
    groupKey = `delivery_${item.delivery_date}_${
      item.delivery_time_slot || 'any'
    }_shipped_${isShipped}`
  } else {
    const isShipped = item.is_shipped_item || false
    const days = item.estimated_delivery_days || '1-2'
    groupKey = `shipping_${days}_shipped_${isShipped}`
  }

  return groupKey
}

function createAuctionGroup(
  item: any,
  context: PurchaseContext,
  deliveryAddress: AddressEntity | null | undefined,
): PurchaseItemGroup {
  const { statusText, statusDate, groupActions, itemNeedsReview } = processAuctionStatus(
    item,
    context,
  )

  const isShipped = item.shipping_info?.is_shipped || false
  const processedItem: PurchaseItem = {
    id: item.id,
    deal_id: item.deal_id,
    deal_name: item.deal_name,
    deal_type: DealType.AUCTION,
    quantity: item.quantity,
    bid_amount: item.bid_amount,
    total_amount: item.total_amount,
    estimated_delivery_days: item.estimated_delivery_days,
    image_url: item.image_url,
    is_shipped: isShipped,
    need_review: itemNeedsReview,
  }

  let title_type: PurchaseItemGroup['title_type'] = 'shipping_date'
  if (item.cancellation_info) {
    title_type = 'cancellation'
  } else if (item.return_exchange_info && item.return_exchange_info.items?.length > 0) {
    title_type = 'return_exchange'
  } else if (item.delivery_date) {
    title_type = 'delivery_date'
  }

  return {
    id: `auction_${item.id}`,
    title: '',
    title_type,
    status_text: statusText,
    status_date: statusDate,
    delivery_date: item.delivery_date,
    delivery_time_slot: item.delivery_time_slot,
    estimated_delivery_days: item.estimated_delivery_days,
    is_shipped: isShipped,
    deal_type: DealType.AUCTION,
    bidId: item.id,
    shipping_info: item.shipping_info,
    return_exchange_info: item.return_exchange_info,
    cancellation_info: item.cancellation_info,
    delivery_address: deliveryAddress, // Add address to group
    available_actions: groupActions.map((a) => a.action),
    action_buttons: groupActions,
    items: [processedItem],
  }
}

function createBuyNowGroups(
  items: any[],
  context: PurchaseContext,
  deliveryAddress: AddressEntity | null | undefined,
): PurchaseItemGroup[] {
  const { isWishlist } = context
  const groups: Record<string, any[]> = {}

  items.forEach((item) => {
    const groupKey = calculateGroupKey(item)
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
  })

  const result: PurchaseItemGroup[] = []

  Object.entries(groups).forEach(([groupKey, groupItems]) => {
    if (groupItems.length === 0) return

    const firstItem = groupItems[0]
    const { statusText, statusDate, groupActions } = processBuyNowStatus(firstItem, context)

    const isGroupShipped = firstItem.is_shipped_item || false

    let title_type: PurchaseItemGroup['title_type'] = 'shipping_date'
    if (groupKey.startsWith('cancel_')) {
      title_type = 'cancellation'
    } else if (groupKey.startsWith('return_')) {
      title_type = 'return_exchange'
    } else if (groupKey.startsWith('delivery_')) {
      title_type = 'delivery_date'
    }

    const processedItems: PurchaseItem[] = groupItems.map((item) => {
      const { itemNeedsReview } = processBuyNowStatus(item, context)
      return {
        id: item.id,
        deal_id: item.deal_id,
        deal_name: item.deal_name,
        deal_type: item.deal_type || DealType.BUYNOW,
        is_wishlist: isWishlist,
        variant: item.variant,
        quantity: item.quantity,
        total: item.total,
        estimated_delivery_days: item.estimated_delivery_days,
        image_url: item.variant?.images?.[0]?.url || item.image_url,
        is_shipped: item.is_shipped_item || false,
        need_review: itemNeedsReview,
      }
    })

    result.push({
      id: groupKey,
      title: '',
      title_type,
      status_text: statusText,
      status_date: statusDate,
      delivery_date: firstItem.delivery_date,
      delivery_time_slot: firstItem.delivery_time_slot,
      estimated_delivery_days: firstItem.estimated_delivery_days,
      is_shipped: isGroupShipped,
      deal_type: DealType.BUYNOW,
      is_wishlist: isWishlist,
      cartId: firstItem.cartId,
      shipping_info: firstItem.shipping_info,
      return_exchange_info: firstItem.return_exchange_info,
      cancellation_info: firstItem.cancellation_info,
      delivery_address: deliveryAddress, // Add address to group
      available_actions: groupActions.map((g) => g.action),
      action_buttons: groupActions,
      items: processedItems,
    })
  })

  return sortGroups(result)
}

function sortGroups(groups: PurchaseItemGroup[]): PurchaseItemGroup[] {
  const typePriority = {
    cancellation: 1,
    return_exchange: 2,
    delivery_date: 3,
    shipping_date: 4,
    no_shipping: 5,
  }

  return groups.sort((a, b) => {
    const priorityA = typePriority[a.title_type] || 999
    const priorityB = typePriority[b.title_type] || 999
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    if (a.status_date && b.status_date) {
      const dateA = a.status_date instanceof Date ? a.status_date : new Date(a.status_date)
      const dateB = b.status_date instanceof Date ? b.status_date : new Date(b.status_date)
      return dateB.getTime() - dateA.getTime()
    }

    if (a.status_date) return -1
    if (b.status_date) return 1

    return 0
  })
}

async function getPurchaseHistoryDetails(
  id: string, // Payment ID
  userId: string, // ID of user viewing the history
  dependencies: PurchaseDetailsDependencies,
  userRole: 'buyer' | 'recipient',
  purchase: UserDealPaymentEntity, // Pass the already fetched purchase object
): Promise<PurchaseItemGroup[]> {
  try {
    const context = await determinePurchaseContext(purchase, userId, userRole, dependencies)

    let groups: PurchaseItemGroup[] = []
    let deliveryAddress: AddressEntity | null | undefined = null

    if (purchase.deal_type === DealType.AUCTION) {
      if (!purchase.bid?.id) return []
      const auctionDetail = await fetchAuctionPurchaseDetail(
        purchase.bid.id,
        context.userId,
        dependencies,
      )
      if (!auctionDetail) return []
      deliveryAddress = purchase.bid.address // Get address from bid
      const auctionGroup = createAuctionGroup(auctionDetail, context, deliveryAddress)
      groups = [auctionGroup]
    } else if (purchase.deal_type === DealType.RAFFLE) {
      if (!purchase.raffle_purchase?.id) return []
      const raffleDetail = await fetchRafflePurchaseDetails(
        purchase.raffle_purchase.id,
        dependencies,
      )
      // Basic grouping for raffle
      groups = [
        {
          id: `raffle_${purchase.raffle_purchase.id}`,
          title: '',
          title_type: 'no_shipping', // Adjust if raffles can ship
          status_text: 'Raffle Entry', // Example status
          status_date: purchase.created, // Use payment creation date
          is_shipped: false,
          deal_type: DealType.RAFFLE,
          rafflePurchaseId: purchase.raffle_purchase.id,
          available_actions: [],
          action_buttons: [],
          items: raffleDetail.map((item) => ({
            id: item.id,
            deal_id: item.deal_id,
            deal_name: item.deal_name,
            deal_type: DealType.RAFFLE,
            quantity: item.quantity,
            total_amount: item.total_amount,
            image_url: item.image_url,
            is_shipped: false,
            need_review: false, // Raffles not reviewable
          })),
          delivery_address: null, // Raffles typically don't have delivery addresses
        },
      ]
    } else if (purchase.deal_type === DealType.BUYNOW) {
      if (!purchase.cart?.id) return []
      const buyNowDetails = await fetchBuyNowPurchaseDetails(
        purchase.cart.id,
        context.userId,
        dependencies,
      )
      if (!buyNowDetails || buyNowDetails.length === 0) return []
      deliveryAddress = purchase.cart.delivery_address // Get address from cart
      groups = createBuyNowGroups(buyNowDetails, context, deliveryAddress)
    }

    // Ensure delivery address is added if missed in initial creation (redundant if added in createXGroup)
    // groups.forEach(group => {
    //     if (!group.delivery_address) {
    //         group.delivery_address = deliveryAddress;
    //     }
    // });

    return groups
  } catch (error) {
    return HandleErrors(error)
  }
}

export default async function (paymentId: string, userId: string) {
  try {
    const dependencies: PurchaseDetailsDependencies = {
      dataSource: this.dataSource,
      userDealPaymentRepository: this.userDealPaymentRepository,
      wishlistRepository: this.wishlistRepository,
      cartRepository: this.cartRepository,
      cartItemRepository: this.cartItemRepository,
      bidRepository: this.bidRepository,
      rafflePurchaseRepository: this.rafflePurchaseRepository,
      orderShippingRepository: this.orderShippingRepository,
      returnExchangeRepository: this.returnExchangeRepository,
      orderCancellationRepository: this.orderCancellationRepository,
      orderCancellationItemRepository: this.orderCancellationItemRepository,
      returnExchangeItemRepository: this.returnExchangeItemRepository,
    }

    // Fetch base payment info, including relations needed for access check and address
    const payment = await fetchBasePurchaseInfo(paymentId, userId, dependencies)

    let userRole: 'buyer' | 'recipient' = 'buyer'
    if (payment.cart?.wishlist?.user?.id === userId && payment.user.id !== userId) {
      userRole = 'recipient'
    }

    const groups = await getPurchaseHistoryDetails(
      paymentId,
      userId,
      dependencies,
      userRole,
      payment, // Pass the fetched payment object
    )

    // The delivery address is now part of each group, so we just return the groups array.
    return groups
  } catch (error) {
    return HandleErrors(error)
  }
}
