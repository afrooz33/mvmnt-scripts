import { In } from 'typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { UpdateReturnExchangeDto } from '@app/src/purchase-history/refund-exchange/dto'
import { OrderReturnRefundEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-refunds.entity'
import { OrderReturnExchangeLogEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-log.entity'
import {
  RefundStatus,
  ReturnProcessOption,
  ReturnExchangeStatus,
  ReturnExchangeLogAction,
} from '@app/src/purchase-history/refund-exchange/enums'

export default async function (
  sellerId: string,
  returnExchangeId: string,
  payload: UpdateReturnExchangeDto,
) {
  try {
    // 1. Fetch the return/exchange request
    const returnExchange = await this.returnExchangeRepository.findOne({
      where: {
        id: returnExchangeId,
        seller: { id: sellerId },
        status: In([ReturnExchangeStatus.REQUESTED, ReturnExchangeStatus.PARTIALLY_APPROVED]),
      },
      relations: [
        'items',
        'items.cart_item',
        'items.bid',
        'seller',
        'buyer',
        'cart',
        'bid',
        'refunds',
      ],
      select: {
        id: true,
        type: true,
        status: true,
        notes_to_seller: true,
        items: {
          id: true,
          status: true,
          quantity_requested: true,
          approved_quantity: true,
          rejected_at: true,
          approved_at: true,
          cart_item: {
            id: true,
            total: true,
            quantity: true,
          },
          bid: {
            id: true,
            bid_amount: true,
            quantity: true,
          },
        },
        seller: {
          id: true,
        },
        buyer: {
          id: true,
          username: true,
          display_name: true,
        },
        cart: {
          id: true,
        },
        bid: {
          id: true,
          bid_amount: true,
          quantity: true,
        },
      },
    })

    if (!returnExchange) {
      throw new NotFoundException(ErrorKey.INVALID_RETURN_EXCHANGE)
    }

    // 2. Fetch the return address
    const returnAddress = await this.addressService.findOne({
      where: {
        id: payload.return_address,
        is_personal: false,
        status: UserAddressStatus.ENABLED,
        profile: {
          user: {
            id: returnExchange.seller?.id,
            account_status: AccountStatus.ENABLED,
          },
        },
      },
      select: {
        id: true,
      },
    })

    if (!returnAddress) {
      throw new NotFoundException(ErrorKey.INVALID_RETURN_ADDRESS)
    }

    // 3. Validate item IDs and quantities in the payload
    for (const item of payload.items) {
      const itemInReq = returnExchange.items.find((i) => i.id === item.id)

      if (!itemInReq) {
        throw new NotFoundException(ErrorKey.INVALID_RETURN_EXCHANGE_ITEM)
      }

      // Determine if this is an auction item or buy now item
      const isAuctionItem = !!itemInReq.bid

      if (
        (item.status === ReturnExchangeStatus.APPROVED ||
          item.status === ReturnExchangeStatus.PARTIALLY_APPROVED) &&
        (!item.approved_quantity || item.approved_quantity <= 0)
      ) {
        throw new BadRequestException(ErrorKey.INVALID_QUANTITY)
      }

      // Crucial Check: Prevent over-approval/rejection
      const totalApproved = (itemInReq.approved_quantity || 0) + (item.approved_quantity || 0)
      if (totalApproved > itemInReq.quantity_requested) {
        throw new BadRequestException(ErrorKey.INVALID_QUANTITY)
      }

      // For auction items, partial approval is not allowed
      if (isAuctionItem && item.status === ReturnExchangeStatus.PARTIALLY_APPROVED) {
        throw new BadRequestException(ErrorKey.INVALID_RETURN_EXCHANGE_ITEM)
      }
    }

    // 4. Start a database transaction
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const itemUpdates = []

      // 5. Process each item update
      for (const item of payload.items) {
        const itemInReq = returnExchange.items.find((i) => i.id === item.id)!
        const previousStatus = itemInReq.status

        // Determine if this is an auction item
        const isAuctionItem = !!itemInReq.bid

        let logAction: ReturnExchangeLogAction

        const logDetails: any = {
          item_id: isAuctionItem ? itemInReq.bid.id : itemInReq.cart_item.id,
          previous_status: previousStatus,
          new_status: item.status,
          is_auction: isAuctionItem,
        }

        // Add bid details for auction items
        if (isAuctionItem && itemInReq.bid) {
          logDetails.bid_amount = itemInReq.bid.bid_amount
        }

        if (item.status === ReturnExchangeStatus.APPROVED) {
          // For auction items, approve the entire item
          if (isAuctionItem) {
            itemInReq.status = ReturnExchangeStatus.APPROVED
            itemInReq.approved_quantity = itemInReq.quantity_requested
          } else {
            // For buy-now items, calculate if it's full or partial approval
            const totalApproved = (itemInReq.approved_quantity || 0) + item.approved_quantity
            itemInReq.status =
              totalApproved >= itemInReq.quantity_requested
                ? ReturnExchangeStatus.APPROVED
                : ReturnExchangeStatus.PARTIALLY_APPROVED
            itemInReq.approved_quantity = totalApproved
          }

          logAction = ReturnExchangeLogAction.ITEM_APPROVED
          logDetails.approved_quantity = itemInReq.approved_quantity
          itemInReq.approved_at = new Date()
        } else if (item.status === ReturnExchangeStatus.PARTIALLY_APPROVED) {
          // Partial approval is only allowed for buy-now items
          if (isAuctionItem) {
            throw new BadRequestException(ErrorKey.INVALID_RETURN_EXCHANGE_ITEM)
          }

          const totalApproved = (itemInReq.approved_quantity || 0) + item.approved_quantity
          itemInReq.status = ReturnExchangeStatus.PARTIALLY_APPROVED
          logAction = ReturnExchangeLogAction.ITEM_APPROVED
          logDetails.approved_quantity = item.approved_quantity
          itemInReq.approved_quantity = totalApproved
          itemInReq.approved_at = new Date()
        } else if (item.status === ReturnExchangeStatus.REJECTED) {
          itemInReq.status = ReturnExchangeStatus.REJECTED
          logAction = ReturnExchangeLogAction.ITEM_REJECTED
          itemInReq.rejected_at = new Date()
        }

        itemUpdates.push({
          item_id: isAuctionItem ? itemInReq.bid.id : itemInReq.cart_item.id,
          previous_status: previousStatus,
          new_status: itemInReq.status,
          approved_quantity: itemInReq.approved_quantity,
          rejected_at: itemInReq.rejected_at,
          approved_at: itemInReq.approved_at,
          log_action: logAction,
          is_auction: isAuctionItem,
        })

        await queryRunner.manager.save(itemInReq)
      }

      // 6. Set shipping fee responsibility and other settings
      returnExchange.shipping_fee_responsibility = payload.shipping_fee_responsibility
      returnExchange.refund_gas_fee_payer = payload.refund_gas_fee_payer
      returnExchange.process_option = payload.process_option
      returnExchange.return_address = { id: payload.return_address }

      // 7. Create a log entry for the overall update
      await queryRunner.manager.save(OrderReturnExchangeLogEntity, {
        return_exchange: { id: returnExchange.id },
        user: { id: sellerId },
        action: ReturnExchangeLogAction.STATUS_UPDATED,
        details: {
          message_to_requester: payload.message_to_requester,
          internal_notes: payload.internal_notes,
          shipping_fee_responsibility: payload.shipping_fee_responsibility,
          refund_gas_fee_payer: payload.refund_gas_fee_payer,
          process_option: payload.process_option,
          items: itemUpdates,
        },
      })

      // 8. Recalculate the overall request status
      const isAuctionReturn = !!returnExchange.bid

      if (isAuctionReturn) {
        // For auction returns, we use a simpler approach
        const allItemsProcessed = returnExchange.items.every(
          (item) => item.status !== ReturnExchangeStatus.REQUESTED,
        )

        // If any items are rejected, the whole return is rejected
        const anyItemRejected = returnExchange.items.some(
          (item) => item.status === ReturnExchangeStatus.REJECTED,
        )

        // If any items are approved and none are rejected, the whole return is approved
        const anyItemApproved = returnExchange.items.some(
          (item) => item.status === ReturnExchangeStatus.APPROVED,
        )

        if (anyItemRejected) {
          returnExchange.status = ReturnExchangeStatus.REJECTED
        } else if (anyItemApproved && allItemsProcessed) {
          returnExchange.status = ReturnExchangeStatus.APPROVED
        } else if (allItemsProcessed) {
          returnExchange.status = ReturnExchangeStatus.PARTIALLY_APPROVED
        }
      } else {
        // For buy-now returns, use the existing logic
        const reItems = await this.returnExchangeItemRepository.find({
          where: { return_exchange: { id: returnExchangeId } },
        })

        let allRejected = true
        let allApproved = true
        let hasPartial = false
        let hasProcessedItem = false

        for (const reItem of reItems) {
          if (reItem.status !== ReturnExchangeStatus.REJECTED) {
            allRejected = false
          }
          if (reItem.approved_quantity !== reItem.quantity_requested) {
            allApproved = false
          }
          if (reItem.status === ReturnExchangeStatus.PARTIALLY_APPROVED) {
            hasPartial = true
          }
          if (reItem.status !== ReturnExchangeStatus.REQUESTED) {
            hasProcessedItem = true
          }
        }

        if (allRejected) {
          returnExchange.status = ReturnExchangeStatus.REJECTED
        } else if (allApproved) {
          returnExchange.status = ReturnExchangeStatus.APPROVED
        } else if (hasPartial) {
          returnExchange.status = ReturnExchangeStatus.PARTIALLY_APPROVED
        } else if (hasProcessedItem) {
          returnExchange.status = ReturnExchangeStatus.PARTIALLY_APPROVED
        }
      }

      // 9. Update messages if provided
      if (payload.message_to_requester) {
        returnExchange.message_to_requester = payload.message_to_requester
      }

      if (payload.internal_notes) {
        returnExchange.internal_notes = payload.internal_notes
      }

      // 10. Process refunds if requested
      if (
        payload.process_option === ReturnProcessOption.RETURN_AND_REFUND &&
        payload.refund_details &&
        payload.refund_details.length > 0
      ) {
        const refunds = []

        for (const refundDetail of payload.refund_details) {
          // Create refund entity with explicit returnExchangeId
          const refund: any = new OrderReturnRefundEntity()

          refund.return_exchange = {
            id: returnExchange.id,
          }
          refund.amount = refundDetail.amount
          refund.fees_refund = refundDetail.fees_refund || 0
          refund.total_refund = refundDetail.amount + (refundDetail.fees_refund || 0)
          refund.max_refundable = refundDetail.amount
          refund.status = payload.process_refund_immediately
            ? RefundStatus.PROCESSING
            : RefundStatus.PENDING
          refund.additional_refund_reason = refundDetail.additional_refund_reason
          refund.processed_by = { id: sellerId }

          refunds.push(refund)
        }

        if (refunds.length > 0) {
          // Save refunds
          await queryRunner.manager.save(OrderReturnRefundEntity, refunds)

          // Store refund IDs for log entry
          const refundIds = refunds.map((r) => ({
            id: r.id,
            amount: r.amount,
            fees_refund: r.fees_refund,
            total_refund: r.total_refund,
            status: r.status,
          }))

          // Create a log entry for the refund creation
          await queryRunner.manager.save(OrderReturnExchangeLogEntity, {
            return_exchange: { id: returnExchange.id },
            user: { id: sellerId },
            action: ReturnExchangeLogAction.REFUND_PROCESSED,
            details: {
              refunds: refundIds,
              immediate_processing: payload.process_refund_immediately,
            },
          })

          // If immediate processing is requested, initiate blockchain transaction
          if (payload.process_refund_immediately) {
            const totalRefundAmount = refunds.reduce((sum, refund) => sum + refund.total_refund, 0)

            try {
              // Placeholder for blockchain service call
              const txHash = await this.blockchainService.processRefund({
                buyerId: returnExchange.buyer.id,
                sellerId: returnExchange.seller.id,
                amount: totalRefundAmount,
                gasFeePayer: payload.refund_gas_fee_payer,
                returnExchangeId: returnExchange.id,
              })

              // Update refunds with transaction hash - using direct query to avoid relationship issues
              for (const refund of refunds) {
                await queryRunner.manager
                  .createQueryBuilder()
                  .update(OrderReturnRefundEntity)
                  .set({
                    transaction_hash: txHash,
                    processed_at: new Date(),
                    status: RefundStatus.COMPLETED,
                  })
                  .where('id = :id', { id: refund.id })
                  .execute()
              }

              returnExchange.status = ReturnExchangeStatus.REFUNDED
            } catch (blockchainError) {
              console.error('Blockchain refund processing failed:', blockchainError)

              // Mark refunds as failed - using direct query to avoid relationship issues
              for (const refund of refunds) {
                await queryRunner.manager
                  .createQueryBuilder()
                  .update(OrderReturnRefundEntity)
                  .set({
                    status: RefundStatus.FAILED,
                    failed_at: new Date(),
                    transaction_details: { error: blockchainError.message },
                  })
                  .where('id = :id', { id: refund.id })
                  .execute()
              }

              // Still proceed with the rest of the return process
            }
          }
        }
      }

      // 11. Save the updated request using a direct update query to avoid relationship issues
      await queryRunner.manager
        .createQueryBuilder()
        .update(returnExchange.constructor.name)
        .set({
          status: returnExchange.status,
          shipping_fee_responsibility: returnExchange.shipping_fee_responsibility,
          refund_gas_fee_payer: returnExchange.refund_gas_fee_payer,
          process_option: returnExchange.process_option,
          message_to_requester: returnExchange.message_to_requester,
          internal_notes: returnExchange.internal_notes,
          return_address: { id: payload.return_address },
        })
        .where('id = :id', { id: returnExchange.id })
        .execute()

      // Commit the transaction
      await queryRunner.commitTransaction()

      // 12. Return the updated request
      return this.findOneReturnExchange(returnExchangeId, sellerId)
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // Release the query runner
      await queryRunner.release()
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
