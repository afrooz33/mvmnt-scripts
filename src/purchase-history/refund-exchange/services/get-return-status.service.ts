import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import {
  ReturnExchangeType,
  ReturnExchangeStatus,
  ReturnExchangeLogAction,
} from '@app/src/purchase-history/refund-exchange/enums'
import { ReturnStatusQueryDto } from '@app/src/purchase-history/refund-exchange/dto/return-status-query.dto'

export default async function (params: ReturnStatusQueryDto, buyerId: string): Promise<any> {
  try {
    // Input validation to ensure at least one ID is provided
    if (!params.cart && !params.bid) {
      throw new BadRequestException(ErrorKey.INVALID_PAYLOAD)
    }

    // Check that only one ID type is provided
    if (params.cart && params.bid) {
      throw new BadRequestException(ErrorKey.INVALID_PAYLOAD)
    }

    const cartId = params.cart
    const bidId = params.bid

    // Step 1: Fetch all log entries, ordered by timestamp DESC (latest first)
    const queryWhere = cartId
      ? { return_exchange: { cart: { id: cartId }, buyer: { id: buyerId } } }
      : { return_exchange: { bid: { id: bidId }, buyer: { id: buyerId } } }

    const logs = await this.returnExchangeLogRepository.find({
      where: queryWhere,
      relations: ['return_exchange'],
      select: {
        id: true,
        action: true,
        timestamp: true,
        details: true,
        return_exchange: {
          id: true,
          type: true,
        },
      },
      order: { timestamp: 'DESC' }, // Correct order: latest events first
    })

    if (!logs.length) return []

    const allItemIds = logs.flatMap(
      (log: any) => log.details?.items?.map((i: any) => i.item_id).filter((id) => id) || [],
    )
    const uniqueItemIds = [...new Set(allItemIds)]

    // Step 2: Fetch related return-exchange items, including shipments
    let returnExchangeItems = []
    if (uniqueItemIds.length > 0) {
      // Create a where condition that handles both cart_item and bid cases
      const whereCondition = cartId
        ? { cart_item: { id: In(uniqueItemIds) } }
        : { bid: { id: In(uniqueItemIds) } }

      // Adjust relations based on whether this is for a cart or bid
      const relations = cartId
        ? {
            cart_item: {
              deal: true,
              variant: {
                images: true,
                option_values: { option: true },
              },
            },
            return_exchange: {
              items: { cart_item: true },
              cart: true,
            },
            shipments: {
              delivery_carrier: true,
            },
          }
        : {
            bid: {
              deal: true,
            },
            return_exchange: {
              items: { bid: true },
              bid: true,
            },
            shipments: {
              delivery_carrier: true,
            },
          }

      // Adjust select fields based on whether this is for a cart or bid
      const selectFields = cartId
        ? {
            id: true,
            cart_item: {
              id: true,
              deal: { id: true, name: true, deal_type: true },
              variant: {
                id: true,
                images: { id: true, url: true },
                option_values: { id: true, value: true, option: { id: true, type: true } },
              },
            },
            return_exchange: {
              id: true,
              type: true,
              items: {
                id: true,
                cart_item: { id: true },
                approved_quantity: true,
                quantity_requested: true,
                shipped_quantity: true,
              },
            },
            shipments: {
              id: true,
              tracking_number: true,
              delivery_carrier: {
                id: true,
                name: true,
              },
            },
          }
        : {
            id: true,
            bid: {
              id: true,
              deal: { id: true, name: true, deal_type: true },
            },
            return_exchange: {
              id: true,
              type: true,
              items: {
                id: true,
                bid: { id: true },
                approved_quantity: true,
                quantity_requested: true,
                shipped_quantity: true,
              },
            },
            shipments: {
              id: true,
              tracking_number: true,
              delivery_carrier: {
                id: true,
                name: true,
              },
            },
          }

      returnExchangeItems = await this.returnExchangeItemRepository.find({
        where: whereCondition,
        relations: relations,
        select: selectFields,
      })
    }

    const groupedLogs: Record<string, any[]> = {}
    for (const log of logs) {
      if (!groupedLogs[log.return_exchange.id]) {
        groupedLogs[log.return_exchange.id] = []
      }
      groupedLogs[log.return_exchange.id].push(log)
    }

    const history: any[] = []
    for (const returnExchangeId in groupedLogs) {
      if (!groupedLogs.hasOwnProperty(returnExchangeId)) continue

      const logsForExchange = groupedLogs[returnExchangeId]

      // No need to reverse, logs are already in DESC order

      for (const logEntry of logsForExchange) {
        let title = ''
        const sections: any[] = []

        switch (logEntry.action) {
          case ReturnExchangeLogAction.REQUEST_CREATED: {
            title = `Requested for ${logEntry.details.type.toLowerCase()}`
            const requestedItemsSection = {
              title: 'Requested Items',
              items: logEntry.details.items
                .map((detail: any) => {
                  const foundItem = returnExchangeItems.find(
                    (rei: any) =>
                      (cartId && rei.cart_item?.id === detail.item_id) ||
                      (bidId && rei.bid?.id === detail.item_id),
                  )
                  if (!foundItem) return null

                  // Create the item details based on whether it's a cart or bid
                  if (cartId) {
                    return {
                      deal: {
                        id: foundItem.cart_item.deal?.id,
                        name: foundItem.cart_item.deal?.name,
                        deal_type: foundItem.cart_item.deal?.deal_type,
                      },
                      variant: {
                        id: foundItem.cart_item.variant?.id,
                        images: foundItem.cart_item.variant?.images?.[0]?.url,
                        option_values: foundItem.cart_item.variant?.option_values,
                      },
                      quantity_requested: detail.quantity_requested,
                      reason: detail.reason,
                      notes: detail.notes,
                    }
                  } else {
                    return {
                      deal: {
                        id: foundItem.bid.deal?.id,
                        name: foundItem.bid.deal?.name,
                        deal_type: foundItem.bid.deal?.deal_type,
                      },
                      quantity_requested: detail.quantity_requested,
                      reason: detail.reason,
                      notes: detail.notes,
                    }
                  }
                })
                .filter(Boolean),
              notes: logEntry.details.notes_to_seller, // Include notes_to_seller here
            }
            sections.push(requestedItemsSection)
            break
          }

          case ReturnExchangeLogAction.STATUS_UPDATED: {
            if (!logEntry.details.items?.length) break

            const anyApproval = logEntry.details.items.some(
              (i: any) =>
                i.new_status === ReturnExchangeStatus.APPROVED ||
                i.new_status === ReturnExchangeStatus.PARTIALLY_APPROVED ||
                i.new_status === ReturnExchangeStatus.REJECTED,
            )
            if (!anyApproval) break

            const firstItem = logEntry.details.items[0]
            const isRefund = logEntry.return_exchange.type === ReturnExchangeType.RETURN

            const isInitialReview = firstItem.previous_status === 'REQUESTED'

            if (isInitialReview) {
              title = `Seller's review of the return request`

              const refundEligibleSection = {
                title: 'Items eligible for return (refund pending seller review)',
                items: [] as any[],
              }
              const exchangeEligibleSection = {
                title: 'Items eligible for return (exchange pending seller review)',
                items: [] as any[],
              }
              const deniedSection = {
                title: 'Items denied for return',
                items: [] as any[],
              }

              logEntry.details.items.forEach((itemUpdate: any) => {
                const foundItem = returnExchangeItems.find(
                  (rei: any) =>
                    (cartId && rei.cart_item?.id === itemUpdate.item_id) ||
                    (bidId && rei.bid?.id === itemUpdate.item_id),
                )
                if (!foundItem) return

                const reType = foundItem.return_exchange.type
                let itemDetail: any

                // Create item detail based on whether it's a cart or bid
                if (cartId) {
                  itemDetail = {
                    deal: {
                      id: foundItem.cart_item.deal?.id,
                      name: foundItem.cart_item.deal?.name,
                      deal_type: foundItem.cart_item.deal?.deal_type,
                    },
                    variant: {
                      id: foundItem.cart_item.variant?.id,
                      images: foundItem.cart_item.variant?.images?.[0]?.url,
                      option_values: foundItem.cart_item.variant?.option_values,
                    },
                  }
                } else {
                  itemDetail = {
                    deal: {
                      id: foundItem.bid.deal?.id,
                      name: foundItem.bid.deal?.name,
                      deal_type: foundItem.bid.deal?.deal_type,
                    },
                  }
                }

                if (
                  itemUpdate.new_status === ReturnExchangeStatus.APPROVED ||
                  itemUpdate.new_status === ReturnExchangeStatus.PARTIALLY_APPROVED
                ) {
                  itemDetail.approved_quantity = itemUpdate.approved_quantity

                  if (reType === ReturnExchangeType.RETURN) {
                    refundEligibleSection.items.push(itemDetail)
                  } else {
                    exchangeEligibleSection.items.push(itemDetail)
                  }
                } else if (itemUpdate.new_status === ReturnExchangeStatus.REJECTED) {
                  const reqItem = foundItem.return_exchange.items.find(
                    (ri: any) =>
                      (cartId && ri.cart_item?.id === itemUpdate.item_id) ||
                      (bidId && ri.bid?.id === itemUpdate.item_id),
                  )
                  itemDetail.quantity_requested = reqItem?.quantity_requested

                  deniedSection.items.push(itemDetail)
                }
              })

              if (refundEligibleSection.items.length) sections.push(refundEligibleSection)
              if (exchangeEligibleSection.items.length) sections.push(exchangeEligibleSection)
              if (deniedSection.items.length) sections.push(deniedSection)
            } else {
              title = isRefund
                ? `Seller's review of the refund request`
                : `Seller's review of the exchange request`

              const refundEligible = { title: 'Items eligible for refund', items: [] as any[] }
              const refundDenied = { title: 'Items denied for refund', items: [] as any[] }
              const exchangeEligible = { title: 'Items eligible for exchange', items: [] as any[] }
              const exchangeDenied = { title: 'Items denied for exchange', items: [] as any[] }

              logEntry.details.items.forEach((itemUpdate: any) => {
                const foundItem = returnExchangeItems.find(
                  (rei: any) =>
                    (cartId && rei.cart_item?.id === itemUpdate.item_id) ||
                    (bidId && rei.bid?.id === itemUpdate.item_id),
                )
                if (!foundItem) return

                let itemDetail: any

                // Create item detail based on whether it's a cart or bid
                if (cartId) {
                  itemDetail = {
                    deal: {
                      id: foundItem.cart_item.deal?.id,
                      name: foundItem.cart_item.deal?.name,
                      deal_type: foundItem.cart_item.deal?.deal_type,
                    },
                    variant: {
                      id: foundItem.cart_item.variant?.id,
                      images: foundItem.cart_item.variant?.images?.[0]?.url,
                      option_values: foundItem.cart_item.variant?.option_values,
                    },
                  }
                } else {
                  itemDetail = {
                    deal: {
                      id: foundItem.bid.deal?.id,
                      name: foundItem.bid.deal?.name,
                      deal_type: foundItem.bid.deal?.deal_type,
                    },
                  }
                }

                if (
                  itemUpdate.new_status === ReturnExchangeStatus.APPROVED ||
                  itemUpdate.new_status === ReturnExchangeStatus.PARTIALLY_APPROVED
                ) {
                  itemDetail.approved_quantity = itemUpdate.approved_quantity

                  if (isRefund) refundEligible.items.push(itemDetail)
                  else exchangeEligible.items.push(itemDetail)
                } else if (itemUpdate.new_status === ReturnExchangeStatus.REJECTED) {
                  const reqItem = foundItem.return_exchange.items.find(
                    (ri: any) =>
                      (cartId && ri.cart_item?.id === itemUpdate.item_id) ||
                      (bidId && ri.bid?.id === itemUpdate.item_id),
                  )
                  itemDetail.quantity_requested = reqItem?.quantity_requested

                  if (isRefund) refundDenied.items.push(itemDetail)
                  else exchangeDenied.items.push(itemDetail)
                }
              })

              if (refundEligible.items.length) sections.push(refundEligible)
              if (refundDenied.items.length) sections.push(refundDenied)
              if (exchangeEligible.items.length) sections.push(exchangeEligible)
              if (exchangeDenied.items.length) sections.push(exchangeDenied)
            }
            // Seller notes (both initial and subsequent)
            if (logEntry.details.message_to_requester) {
              sections.push({
                title: 'NOTES',
                notes: logEntry.details.message_to_requester,
              })
            }
            break
          }

          case ReturnExchangeLogAction.ITEM_SHIPPED: {
            title = `Items shipped for return`
            const shippedItemsSection = {
              title: 'List of items shipped for return',
              items: [] as any[],
            }

            const relatedReturnExchange = returnExchangeItems.find(
              (rei) => rei.return_exchange.id === logEntry.return_exchange.id,
            )

            if (relatedReturnExchange) {
              for (const item of relatedReturnExchange.return_exchange.items) {
                let isMatch = false
                let itemDetails: any = {}

                if (cartId && relatedReturnExchange.cart_item?.id === item.cart_item?.id) {
                  isMatch = true
                  const cartItem = relatedReturnExchange.cart_item
                  itemDetails = {
                    deal: {
                      id: cartItem.deal?.id,
                      name: cartItem.deal?.name,
                      deal_type: cartItem.deal?.deal_type,
                    },
                    variant: {
                      id: cartItem.variant?.id,
                      images: cartItem.variant?.images?.[0]?.url,
                      option_values: cartItem.variant?.option_values,
                    },
                  }
                } else if (bidId && relatedReturnExchange.bid?.id === item.bid?.id) {
                  isMatch = true
                  const bidItem = relatedReturnExchange.bid
                  itemDetails = {
                    deal: {
                      id: bidItem.deal?.id,
                      name: bidItem.deal?.name,
                      deal_type: bidItem.deal?.deal_type,
                    },
                  }
                }

                if (isMatch) {
                  itemDetails.shipped_quantity = item.shipped_quantity
                  shippedItemsSection.items.push(itemDetails)
                }
              }
            }

            // Extract tracking information from all items and flatten it
            const trackingInfoArray = logEntry.details.items.flatMap(
              (item) => item.tracking_info || [],
            )

            sections.push(
              shippedItemsSection,
              {
                title: 'PACKAGE_TRACKING_INFO',
                items: trackingInfoArray.map((info) => ({
                  tracking_number: info.tracking_number,
                  delivery_carrier: info.delivery_carrier,
                })),
              },
              {
                title: 'NOTES',
                notes: logEntry.details.notes_to_seller,
              },
            )
            break
          }

          case ReturnExchangeLogAction.REFUND_PROCESSED: {
            title = 'Refunded'
            const refundItemsSection = {
              title: 'List of items eligible for a refund',
              items: [] as any[],
            }

            const reForRefund = returnExchangeItems.find(
              (rei) => rei.return_exchange.id === logEntry.return_exchange.id,
            )

            if (reForRefund) {
              for (const it of reForRefund.return_exchange.items) {
                let isMatch = false
                let itemDetails: any = {}

                if (cartId && reForRefund.cart_item?.id === it.cart_item?.id) {
                  isMatch = true
                  const cartItem = reForRefund.cart_item
                  itemDetails = {
                    deal: {
                      id: cartItem.deal?.id,
                      name: cartItem.deal?.name,
                      deal_type: cartItem.deal?.deal_type,
                    },
                    variant: {
                      id: cartItem.variant?.id,
                      images: cartItem.variant?.images?.[0]?.url,
                      option_values: cartItem.variant?.option_values,
                    },
                  }
                } else if (bidId && reForRefund.bid?.id === it.bid?.id) {
                  isMatch = true
                  const bidItem = reForRefund.bid
                  itemDetails = {
                    deal: {
                      id: bidItem.deal?.id,
                      name: bidItem.deal?.name,
                      deal_type: bidItem.deal?.deal_type,
                    },
                  }
                }

                if (isMatch) {
                  itemDetails.approved_quantity = it.approved_quantity
                  refundItemsSection.items.push(itemDetails)
                }
              }
              sections.push(refundItemsSection)
            }

            sections.push(
              {
                title: 'Refunded details',
                items: [{ deal_name: 'Refund Amount: (Placeholder)' }],
              },
              {
                title: 'Transaction Info',
                items: [
                  { deal_name: `Refund ID: ${logEntry.details.refundId || 'N/A'}` },
                  { deal_name: `Refund sent from: ${logEntry.details.refundFrom || 'N/A'}` },
                  { deal_name: `Refund MVMNT wallet: ${logEntry.details.refundTo || 'N/A'}` },
                  { deal_name: `Transaction ID: ${logEntry.details.transactionId || 'N/A'}` },
                ],
              },
            )
            if (logEntry.details.message_to_requester) {
              sections.push({
                title: 'NOTES',
                notes: logEntry.details.message_to_requester,
              })
            }
            break
          }

          case ReturnExchangeLogAction.EXCHANGE_SHIPPED: {
            title = 'Exchange items have been shipped'
            const exchangeItemsSection = {
              title: 'List of items sent as an exchange',
              items: [] as any[],
            }

            const reForExchange = returnExchangeItems.find(
              (rei) => rei.return_exchange.id === logEntry.return_exchange.id,
            )

            if (reForExchange) {
              for (const it of reForExchange.return_exchange.items) {
                let isMatch = false
                let itemDetails: any = {}

                if (cartId && reForExchange.cart_item?.id === it.cart_item?.id) {
                  isMatch = true
                  const cartItem = reForExchange.cart_item
                  itemDetails = {
                    deal: {
                      id: cartItem.deal?.id,
                      name: cartItem.deal?.name,
                      deal_type: cartItem.deal?.deal_type,
                    },
                    variant: {
                      id: cartItem.variant?.id,
                      images: cartItem.variant?.images?.[0]?.url,
                      option_values: cartItem.variant?.option_values,
                    },
                  }
                } else if (bidId && reForExchange.bid?.id === it.bid?.id) {
                  isMatch = true
                  const bidItem = reForExchange.bid
                  itemDetails = {
                    deal: {
                      id: bidItem.deal?.id,
                      name: bidItem.deal?.name,
                      deal_type: bidItem.deal?.deal_type,
                    },
                  }
                }

                if (isMatch) {
                  itemDetails.shipped_quantity = it.shipped_quantity
                  exchangeItemsSection.items.push(itemDetails)
                }
              }
            }

            // Get tracking info, prioritizing shipments from the related item if available
            let trackingInfo = []
            if (reForExchange?.shipments?.length > 0) {
              trackingInfo = reForExchange.shipments.map((shipment) => ({
                tracking_number: shipment.tracking_number,
                delivery_carrier: shipment.delivery_carrier,
              }))
            } else {
              // Fallback to the old approach
              const exchangeShipmentDetails =
                reForExchange?.return_exchange?.items?.[0]?.shipments?.[0]
              if (exchangeShipmentDetails) {
                trackingInfo = [
                  {
                    tracking_number: exchangeShipmentDetails.tracking_number,
                    delivery_carrier: exchangeShipmentDetails.delivery_carrier,
                  },
                ]
              }
            }

            sections.push(exchangeItemsSection, {
              title: 'PACKAGE_TRACKING_INFO',
              items: trackingInfo,
            })
            if (logEntry.details.message_to_requester) {
              sections.push({
                title: 'NOTES',
                notes: logEntry.details.message_to_requester,
              })
            }

            break
          }

          default:
            break
        }

        if (title) {
          history.push({
            title,
            date: logEntry.timestamp,
            sections: sections.length ? sections : undefined,
          })
        }
      }
    }

    return history
  } catch (error) {
    return HandleErrors(error)
  }
}
