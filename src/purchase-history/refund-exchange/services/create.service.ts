import { In } from 'typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { CreateReturnExchangeDto } from '@app/src/purchase-history/refund-exchange/dto'
import { OrderReturnExchangeEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange.entity'
import { OrderReturnExchangeLogEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-log.entity'
import { OrderReturnExchangeItemEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-item.entity'
import {
  ReturnExchangeType,
  ReturnExchangeStatus,
  ReturnExchangeLogAction,
} from '@app/src/purchase-history/refund-exchange/enums'

export default async function (
  payload: CreateReturnExchangeDto,
  buyerId: string,
): Promise<OrderReturnExchangeEntity> {
  try {
    let cart = null
    let bid = null
    let isWishlistGift = false

    // Validation: bid and cart cannot be present at the same time
    if (payload.bid && payload.cart) {
      throw new BadRequestException(ErrorKey.INVALID_RETURN_EXCHANGE_PAYLOAD)
    }

    // Check if this is a bid (auction) type deal
    if (payload.bid) {
      // 1) Check if this is a valid auction purchase by the user
      bid = await this.bidRepository.findOne({
        where: {
          id: payload.bid,
          user: { id: buyerId },
          status: In([BidStatus.COMPLETED, BidStatus.WAITING_SHIPMENT]),
        },
        relations: ['deal', 'deal.user'],
        select: {
          id: true,
          quantity: true, // Select bid quantity
          deal: {
            id: true,
            user: {
              id: true,
            },
          },
        },
      })

      if (!bid) {
        throw new NotFoundException(ErrorKey.INVALID_BID)
      }

      // Check payment record exists
      const payment = await this.dealPaymentRepository.findOne({
        where: {
          bid: { id: bid.id },
        },
        select: {
          id: true,
        },
      })

      if (!payment) {
        throw new NotFoundException(ErrorKey.PAYMENT_NOT_FOUND)
      }

      // Check item payment record
      const itemPayment = await this.dealItemPaymentRepository.findOne({
        where: {
          payment: { id: payment.id },
          deal: { id: bid.deal.id },
        },
        select: {
          id: true,
        },
      })

      if (!itemPayment) {
        throw new NotFoundException(ErrorKey.PAYMENT_NOT_FOUND)
      }

      // For auction, the item to return/exchange is tied to the deal ID in the bid
      // We'll validate the requested item against the bid's deal ID later
    } else if (payload.cart) {
      // Original BUYNOW flow
      // 1) Load cart that belongs to the buyer and is shipped
      cart = await this.cartRepository.findOne({
        where: {
          id: payload.cart,
          user: { id: buyerId },
          status: In([CartStatus.SHIPPED, CartStatus.PARTIALLY_SHIPPED]),
        },
        relations: ['seller', 'user', 'wishlist'],
        select: {
          id: true,
          purchase_date: true,
          return_deadline: true,
          user: {
            id: true,
          },
          seller: {
            id: true,
          },
          wishlist: {
            id: true,
          },
        },
      })

      if (!cart) {
        throw new NotFoundException(ErrorKey.INVALID_CART)
      }

      if (new Date(cart.return_deadline).getTime() < new Date().getTime()) {
        throw new BadRequestException(ErrorKey.RETURN_NOT_ALLOWED)
      }

      // Check if this is a wishlist gift
      if (cart?.wishlist?.id) {
        isWishlistGift = true

        // If this is a wishlist gift and user is trying to request a return, throw error
        if (payload.type === ReturnExchangeType.RETURN) {
          throw new BadRequestException(ErrorKey.GIFT_RECIPIENT_CANNOT_RETURN)
        }
      }

      const cartItems = payload.items.map((item) => item.cart_item)

      cart.items = await this.cartItemRepository.find({
        where: {
          id: In(cartItems),
          cart: { id: cart.id },
        },
        select: {
          id: true,
          quantity: true,
        },
      })

      if (cart.items.length !== cartItems.length) {
        throw new BadRequestException(ErrorKey.INVALID_CART_ITEM)
      }
    } else {
      throw new BadRequestException(ErrorKey.INVALID_RETURN_EXCHANGE)
    }

    // 2) Quantity Check
    for (const requestedItem of payload.items) {
      // If we have a cart, perform quantity check against cart items
      if (cart) {
        const cartItem = cart.items.find((ci) => ci.id === requestedItem.cart_item)

        if (!cartItem) {
          throw new NotFoundException(ErrorKey.MISMATCH_ORDER_QUANTITY)
        }

        const activeRequests = await this.returnExchangeItemRepository.find({
          where: {
            cart_item: { id: requestedItem.cart_item },
            status: In([
              ReturnExchangeStatus.REQUESTED,
              ReturnExchangeStatus.APPROVED,
              ReturnExchangeStatus.PARTIALLY_APPROVED,
              ReturnExchangeStatus.PROCESSING,
            ]),
          },
        })

        const sumActive = activeRequests.reduce((acc, i) => acc + (i.quantity_requested || 0), 0)
        const newTotal = sumActive + requestedItem.quantity_requested

        if (newTotal > cartItem.quantity) {
          throw new BadRequestException(ErrorKey.MISMATCH_ORDER_QUANTITY)
        }
      }
      // If we have a bid (auction), perform quantity check against bid quantity
      else if (bid) {
        // For auctions, the requested cart_item should be the deal ID
        if (requestedItem.cart_item !== bid.deal.id) {
          throw new NotFoundException(ErrorKey.INVALID_BID)
        }

        const activeRequests = await this.returnExchangeItemRepository.find({
          where: {
            bid: { id: payload.bid }, // Use bid ID for active requests on auction items
            status: In([
              ReturnExchangeStatus.REQUESTED,
              ReturnExchangeStatus.APPROVED,
              ReturnExchangeStatus.PARTIALLY_APPROVED,
              ReturnExchangeStatus.PROCESSING,
            ]),
          },
        })

        const sumActive = activeRequests.reduce((acc, i) => acc + (i.quantity_requested || 0), 0)
        const newTotal = sumActive + requestedItem.quantity_requested

        if (newTotal > bid.quantity) {
          throw new BadRequestException(ErrorKey.MISMATCH_ORDER_QUANTITY)
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 3a) Create main return-exchange record
      const returnExchangeData = {
        buyer: { id: buyerId },
        seller: cart ? { id: cart.seller.id } : { id: bid.deal.user.id },
        cart: cart ? { id: cart.id } : null,
        bid: bid ? { id: bid.id } : null,
        type: payload.type,
        status: ReturnExchangeStatus.REQUESTED,
        requested_at: new Date(),
        notes_to_seller: payload.notes_to_seller,
        is_wishlist_gift: isWishlistGift,
      }

      const savedRequest = await queryRunner.manager.save(
        OrderReturnExchangeEntity,
        returnExchangeData,
      )

      // 3b) Create item records
      const itemsToSave = payload.items.map((item) => {
        const newItem = this.returnExchangeItemRepository.create({
          return_exchange: { id: savedRequest.id },
          quantity_requested: item.quantity_requested,
          reason: item.reason,
          notes: item.notes,
          status: ReturnExchangeStatus.REQUESTED,
        })
        if (payload.cart) {
          newItem.cart_item = { id: item.cart_item }
        } else if (payload.bid) {
          newItem.bid = { id: payload.bid }
        }
        return newItem
      })

      const savedItems = await queryRunner.manager.save(OrderReturnExchangeItemEntity, itemsToSave)

      // --- LOGGING (Single log entry, with all item details) ---
      await queryRunner.manager.save(OrderReturnExchangeLogEntity, {
        return_exchange: { id: savedRequest.id },
        user: { id: buyerId },
        action: ReturnExchangeLogAction.REQUEST_CREATED,
        details: {
          type: payload.type,
          notes_to_seller: payload.notes_to_seller,
          is_auction: !!bid,
          is_wishlist_gift: isWishlistGift,
          items: savedItems.map((item) => ({
            item_id: item.cart_item?.id || item.bid?.id,
            quantity_requested: item.quantity_requested,
            reason: item.reason,
            notes: item.notes,
          })),
        },
      })
      // --- END LOGGING ---

      await queryRunner.commitTransaction()

      return this.findOneReturnExchange(savedRequest.id, buyerId)
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
