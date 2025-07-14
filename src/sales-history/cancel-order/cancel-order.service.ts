import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource, Not } from 'typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { ErrorKey } from '@app/src/shared/enums/error-key.enum'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { OrderCancellationEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation.entity'
import { OrderCancellationLogEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-log.entity'
import { OrderCancellationItemEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-item.entity'
import {
  CancellationStatus,
  CancellationLogAction,
} from '@app/src/purchase-history/cancel-order/enums'
import { showService, showOneService } from './services'
import { RejectCancellationDto, ApproveCancellationDto } from './dto'

@Injectable()
export class CancelOrderService extends MyService<OrderCancellationEntity> {
  constructor(
    @InjectRepository(OrderCancellationEntity)
    private readonly cancellationRepository: Repository<OrderCancellationEntity>,
    @InjectRepository(OrderCancellationItemEntity)
    private readonly cancellationItemRepository: Repository<OrderCancellationItemEntity>,
    @InjectRepository(OrderCancellationLogEntity)
    private readonly cancellationLogRepository: Repository<OrderCancellationLogEntity>,
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    private readonly cartItemRepository: Repository<BuynowCartItemEntity>,
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(cancellationRepository, 'cancel-order')
  }

  show = showService.bind(this)
  showOne = showOneService.bind(this)

  /**
   * Approve (potentially partially) and process refund for a cancellation request.
   * @param id Cancellation request ID (OrderCancellationEntity ID)
   * @param sellerId Seller ID
   * @param payload Approval data including items and quantities
   */
  async approveAndRefundCancellationRequest(
    id: string,
    sellerId: string,
    payload: ApproveCancellationDto, // Uses the updated DTO
  ): Promise<OrderCancellationEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Fetch the cancellation request with all necessary relations
      const cancellation = await queryRunner.manager.findOne(OrderCancellationEntity, {
        where: {
          id,
          seller: { id: sellerId },
          // Ensure we only process requests that are currently 'REQUESTED'
          status: CancellationStatus.REQUESTED,
        },
        relations: [
          'items', // Essential for accessing requested quantities
          'items.cart_item', // Needed for original BuyNow quantity check
          'cart', // Needed for BuyNow order details & status update
          'cart.items', // Needed for original BuyNow quantities
          'bid', // Needed for Auction order details & status update
          'seller', // For validation
          'buyer', // Needed for blockchain refund (if implemented)
        ],
      })

      if (!cancellation) {
        throw new NotFoundException(ErrorKey.CANCELLATION_REQUEST_NOT_FOUND)
      }

      // 2. Validate Payload Items and Quantities
      if (!payload.items || payload.items.length === 0) {
        throw new BadRequestException('Approval payload must contain items to approve.')
      }

      const approvedItemDetailsLog = [] // For logging
      let totalCalculatedRefund = 0 // Recalculate refund based on approved items

      for (const itemToApprove of payload.items) {
        const cancellationItem = cancellation.items.find((dbItem) => dbItem.id === itemToApprove.id)

        if (!cancellationItem) {
          throw new NotFoundException(
            `Cancellation item with ID ${itemToApprove.id} not found in request ${id}.`,
          )
        }

        // Validation 1: Approved quantity cannot exceed requested cancellation quantity
        if (itemToApprove.approved_quantity > cancellationItem.quantity_to_cancel) {
          throw new BadRequestException(
            `Approved quantity (${itemToApprove.approved_quantity}) for item ${cancellationItem.id} exceeds requested cancel quantity (${cancellationItem.quantity_to_cancel}).`,
          )
        }

        // Validation 2: Approved quantity cannot exceed original ordered quantity
        let originalQuantity = 0
        let itemPrice = 0 // You need to fetch the price per item for refund calculation

        if (cancellationItem.cart_item) {
          // Find the original cart item from the main cart relation
          const originalCartItem = cancellation.cart?.items.find(
            (ci) => ci.id === cancellationItem.cart_item.id,
          )
          if (!originalCartItem) {
            // If not found directly, fetch explicitly (should ideally be preloaded)
            const fetchedCartItem = await queryRunner.manager.findOne(BuynowCartItemEntity, {
              where: { id: cancellationItem.cart_item.id },
            })
            if (!fetchedCartItem) {
              throw new NotFoundException(
                `Original cart item ${cancellationItem.cart_item.id} not found.`,
              )
            }
            originalQuantity = fetchedCartItem.quantity
            itemPrice = fetchedCartItem.total / fetchedCartItem.quantity // Price per unit
          } else {
            originalQuantity = originalCartItem.quantity
            itemPrice = originalCartItem.total / originalCartItem.quantity // Price per unit
          }
        } else if (cancellation.bid) {
          // For bids, the quantity is on the bid entity itself
          originalQuantity = cancellation.bid.quantity
          // Price calculation for bids might depend on bid_amount / quantity
          itemPrice = cancellation.bid.bid_amount / cancellation.bid.quantity // Example: Price per unit
        }

        if (itemToApprove.approved_quantity > originalQuantity) {
          throw new BadRequestException(
            `Approved quantity (${itemToApprove.approved_quantity}) for item ${cancellationItem.id} exceeds original ordered quantity (${originalQuantity}).`,
          )
        }

        // Update the cancellation item entity
        cancellationItem.approved_quantity = itemToApprove.approved_quantity
        // Setting status to APPROVED here. It will become REFUNDED after successful payment.
        // If you need a distinct APPROVED state before refund, adjust accordingly.
        cancellationItem.status = CancellationStatus.APPROVED
        await queryRunner.manager.save(OrderCancellationItemEntity, cancellationItem)

        // Add details for logging
        approvedItemDetailsLog.push({
          item_id: cancellationItem.id,
          cart_item_id: cancellationItem.cart_item?.id,
          deal_id: cancellationItem.deal?.id, // Assuming deal link exists or is added
          quantity_requested: cancellationItem.quantity_to_cancel,
          quantity_approved: cancellationItem.approved_quantity,
        })

        // Accumulate refund amount (ensure itemPrice is correctly determined)
        totalCalculatedRefund += itemPrice * cancellationItem.approved_quantity
      }

      // TODO: 3. Process Blockchain Refund Transaction (Placeholder)
      // This is where you would call your blockchain service
      // const blockchainTx = await this.blockchainService.processRefund({
      //   buyerWallet: cancellation.buyer.walletAddress, // Assuming buyer wallet is available
      //   sellerWallet: cancellation.seller.walletAddress, // Assuming seller wallet is available
      //   amount: totalCalculatedRefund, // Use calculated amount
      //   tokenSymbol: payload.token_symbol,
      //   gasFeePayer: payload.gas_fee_payer,
      //   orderId: id, // Link refund to cancellation request
      // });

      // Dummy transaction data for now
      const dummyTx = {
        refundId: `RF${Math.floor(Math.random() * 100000)}`,
        transactionHash: `TX_DUMMY_${Math.random().toString(16).substring(2, 12)}`,
        fromWallet: 'SELLER_WALLET_DUMMY',
        toWallet: 'BUYER_WALLET_DUMMY',
      }
      const refundSuccessful = true // Assume success for now

      if (!refundSuccessful) {
        // Handle refund failure (e.g., log error, potentially revert item status)
        // Consider throwing an error or setting a specific FAILED status
        throw new Error('Blockchain refund transaction failed.') // Or handle more gracefully
      }

      // 4. Update Overall Cancellation Request Status and Details
      cancellation.status = CancellationStatus.REFUNDED // Set to REFUNDED on successful refund
      cancellation.approved_at = new Date()
      cancellation.refunded_at = new Date() // Set refund timestamp
      cancellation.refund_amount = totalCalculatedRefund // Use calculated amount
      // Assuming refund_amount_in_token needs similar calculation or comes from blockchain result
      cancellation.refund_amount_in_token = payload.refund_amount_in_token // Keep payload for now, adjust as needed
      cancellation.token_symbol = payload.token_symbol
      cancellation.gas_fee_payer = payload.gas_fee_payer
      cancellation.seller_notes = payload.seller_notes
      // Store blockchain transaction details
      cancellation.refund_id = dummyTx.refundId
      cancellation.refund_from_wallet = dummyTx.fromWallet
      cancellation.refund_to_wallet = dummyTx.toWallet
      cancellation.refund_transaction_id = dummyTx.transactionHash

      await queryRunner.manager.save(OrderCancellationEntity, cancellation)

      // Update item statuses to REFUNDED now that payment is 'successful'
      for (const item of cancellation.items) {
        // Only update items that were actually approved in this payload run
        if (payload.items.some((pItem) => pItem.id === item.id)) {
          item.status = CancellationStatus.REFUNDED
          await queryRunner.manager.save(OrderCancellationItemEntity, item)
        }
      }

      // 5. Logging
      // Log approval action
      await queryRunner.manager.save(OrderCancellationLogEntity, {
        cancellation: { id: cancellation.id },
        user: { id: sellerId },
        action: CancellationLogAction.REQUEST_APPROVED, // Log distinct approval
        details: {
          approved_items: approvedItemDetailsLog,
          seller_notes: payload.seller_notes,
          gas_fee_payer: payload.gas_fee_payer,
        },
      })

      // Log refund action
      await queryRunner.manager.save(OrderCancellationLogEntity, {
        cancellation: { id: cancellation.id },
        user: { id: sellerId },
        action: CancellationLogAction.REFUND_PROCESSED,
        details: {
          refund_id: cancellation.refund_id,
          refund_amount: cancellation.refund_amount,
          refund_amount_in_token: cancellation.refund_amount_in_token,
          token_symbol: cancellation.token_symbol,
          transaction_id: cancellation.refund_transaction_id,
        },
      })

      // 6. Update Original Order Status (Cart/Bid)
      if (cancellation.cart) {
        // Reload cart items and cancellation items within the transaction for accurate status check
        const currentCartItems = await queryRunner.manager.find(BuynowCartItemEntity, {
          where: { cart: { id: cancellation.cart.id } },
        })
        const currentCancellationItems = await queryRunner.manager.find(
          OrderCancellationItemEntity,
          {
            where: {
              cancellation: { cart: { id: cancellation.cart.id } },
              status: Not(CancellationStatus.REJECTED),
            }, // Consider only non-rejected cancellations
            relations: ['cart_item'],
          },
        )

        const totalOriginalQty = currentCartItems.reduce((sum, item) => sum + item.quantity, 0)
        const totalCancelledQty = currentCancellationItems.reduce(
          (sum, item) => sum + (item.approved_quantity || 0),
          0,
        ) // Sum approved quantities

        let newCartStatus = cancellation.cart.status // Default to current status

        if (totalCancelledQty >= totalOriginalQty) {
          newCartStatus = CartStatus.CANCELLED
        } else if (totalCancelledQty > 0) {
          newCartStatus = CartStatus.PARTIALLY_CANCELLED // Use a dedicated partial status
        } // else: remains as it was (e.g., COMPLETED, WAITING_SHIPMENT) if nothing approved

        // Only update if status changes
        if (newCartStatus !== cancellation.cart.status) {
          await queryRunner.manager.update(
            BuynowCartEntity,
            { id: cancellation.cart.id },
            { status: newCartStatus },
          )
        }
      } else if (cancellation.bid) {
        // For bids, cancellation typically cancels the whole bid if approved
        const approvedItem = cancellation.items.find(
          (item) => item.status === CancellationStatus.REFUNDED,
        ) // Check if any item was refunded
        if (approvedItem && approvedItem.approved_quantity >= cancellation.bid.quantity) {
          await queryRunner.manager.update(
            BidEntity,
            { id: cancellation.bid.id },
            { status: BidStatus.CANCELLED }, // Or a more specific status if needed
          )
        }
        // Handle partial bid cancellation if logic allows (currently seems all-or-nothing)
      }

      // 7. Commit Transaction
      await queryRunner.commitTransaction()

      // 8. Return updated entity (refetch for fresh state)
      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()

      return HandleErrors(error)
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Reject a cancellation request
   * @param id Cancellation request ID
   * @param sellerId Seller ID
   * @param payload Rejection data
   */
  async rejectCancellationRequest(
    id: string,
    sellerId: string,
    payload: RejectCancellationDto,
  ): Promise<OrderCancellationEntity> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      // Find the cancellation request
      const cancellation = await queryRunner.manager.findOne(OrderCancellationEntity, {
        where: {
          id,
          seller: { id: sellerId },
          status: CancellationStatus.REQUESTED, // Can only reject 'REQUESTED'
        },
        relations: ['items'], // Load items to update their status
      })

      if (!cancellation) {
        throw new NotFoundException(ErrorKey.CANCELLATION_REQUEST_NOT_FOUND)
      }

      // Update cancellation status
      cancellation.status = CancellationStatus.REJECTED
      cancellation.rejected_at = new Date()
      cancellation.seller_notes = payload.reason // Store rejection reason
      await queryRunner.manager.save(OrderCancellationEntity, cancellation)

      // Update all associated items to REJECTED
      for (const item of cancellation.items) {
        item.status = CancellationStatus.REJECTED
        await queryRunner.manager.save(OrderCancellationItemEntity, item)
      }

      // Add log entry
      await queryRunner.manager.save(OrderCancellationLogEntity, {
        cancellation: { id: cancellation.id },
        user: { id: sellerId },
        action: CancellationLogAction.REQUEST_REJECTED,
        details: {
          reason: payload.reason,
        },
      })

      await queryRunner.commitTransaction()

      // Return the updated cancellation request (refetch)
      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()

      return HandleErrors(error)
    } finally {
      await queryRunner.release()
    }
  }

  async findOne(id: string): Promise<OrderCancellationEntity> {
    const cancellation = await this.cancellationRepository.findOne({
      where: { id },
      relations: [
        'buyer',
        'seller',
        'cart',
        'bid',
        'items',
        'items.cart_item',
        'items.deal',
        'logs',
        'logs.user',
      ],
    })
    if (!cancellation) {
      throw new NotFoundException(`Cancellation request ${id} not found.`)
    }
    return cancellation
  }
}
