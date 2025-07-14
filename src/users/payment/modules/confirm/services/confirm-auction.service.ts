import { DateTime } from 'luxon'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository, EntityManager } from 'typeorm'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { StarsService } from '@app/src/users/stars/stars.service'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { InventoryService } from '@app/src/sales-history/shipping/inventory.service'
import { TransactionFlowIndicator } from '@app/src/users/wallet-transaction-history/enums'
import { WalletHistoryTransactionType } from '@app/src/users/wallet-transaction-history/enums'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { CreateWalletTransactionHistoryDto } from '@app/src/users/wallet-transaction-history/dto'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { ConfirmPaymentHelper } from '@app/src/users/payment/modules/confirm/helper/confirm-payment.helper'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { OrderOriginReservationEntity } from '@app/src/sales-history/shipping/entities/order-origin-reservations.entity'
import { WalletTransactionHistoryService } from '@app/src/users/wallet-transaction-history/wallet-transaction-history.service'

@Injectable()
export class ConfirmAuctionPaymentService {
  private readonly logger = new Logger(ConfirmAuctionPaymentService.name)

  constructor(
    @InjectRepository(BidEntity)
    protected readonly bidRepository: Repository<BidEntity>,
    protected readonly confirmPaymentHelper: ConfirmPaymentHelper,
    private readonly starsService: StarsService,
    private readonly inventoryService: InventoryService,
    @InjectRepository(OrderOriginReservationEntity)
    private readonly reservationRepository: Repository<OrderOriginReservationEntity>,
    @InjectRepository(DealVariantInventoryEntity)
    private readonly dealVariantInventoryRepository: Repository<DealVariantInventoryEntity>,
    private readonly entityManager: EntityManager,
    private readonly walletTransactionHistoryService: WalletTransactionHistoryService,
    private readonly userPointsService: UserPointsService,
  ) {}

  confirmAuctionPayment = async (paymentItem: UserDealItemPaymentEntity) => {
    const queryRunner = this.entityManager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      //  1. Get details of the Bid
      const bid: BidEntity = await queryRunner.manager.findOne(BidEntity, {
        where: {
          id: paymentItem.payment?.bid?.id,
          user: {
            id: paymentItem.sender.id,
          },
          deal: {
            deal_type: DealType.AUCTION,
            id: paymentItem.deal.id,
          },
          status: BidStatus.AWARDED,
        },
        relations: [Query.USER, Query.DEAL],
      })

      if (!bid) {
        throw new NotFoundException(ErrorKey.INVALID_BID)
      }

      //  2. Update Bid Status
      bid.status = BidStatus.WAITING_SHIPMENT
      bid.purchase_date = DateTime.now().toJSDate()
      bid.return_deadline = DateTime.now().plus({ days: 16 }).toJSDate()

      await queryRunner.manager.save(BidEntity, bid)

      //  3. Mark all other bids as rejected, and set deal status to ENDED
      await queryRunner.manager.update(
        BidEntity,
        {
          id: Not(bid.id),
          deal: {
            id: bid.deal.id,
          },
          status: BidStatus.PENDING,
        },
        {
          status: BidStatus.REJECTED,
        },
      )

      // Update deal status to ENDED
      // Check current status before updating to avoid unintended changes if already ended/cancelled
      await queryRunner.manager.update(
        DealEntity,
        {
          id: bid.deal.id,
          status: DealStatus.ON_DEAL,
        },
        { status: DealStatus.ENDED },
      )

      // 4. Find and commit temporary inventory reservations linked to the bid
      const bidIdForReservation = paymentItem.payment?.bid?.id || bid?.id
      if (bidIdForReservation) {
        const reservations = await queryRunner.manager.find(OrderOriginReservationEntity, {
          where: {
            bid: { id: bidIdForReservation },
            expires_at: Not(null),
          },
        })
        for (const reservation of reservations) {
          reservation.expires_at = null
          await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
        }
      }

      // 5. Decrease quantity from deal variant inventory (if applicable for auctions)
      if (paymentItem.deal_variant) {
        const dealVariantInventory = await queryRunner.manager.findOne(DealVariantInventoryEntity, {
          where: { variant: { id: paymentItem.deal_variant.id } },
        })
        if (dealVariantInventory) {
          dealVariantInventory.quantity =
            Number(dealVariantInventory.quantity) - Number(paymentItem.quantity)
          await queryRunner.manager.save(DealVariantInventoryEntity, dealVariantInventory)
        } else {
          this.logger.warn(
            `Inventory record not found for variant ${paymentItem.deal_variant.id} during auction confirmation, quantity not decreased.`,
          )
        }
      }

      //  6. Mark the payment as complete
      await this.confirmPaymentHelper.updatePayment(paymentItem.payment, paymentItem)

      // 6.1 Confirm point redemption if points were used
      // Fetch the full UserDealPaymentEntity to check points_used and pass to points service
      const fullDealPayment = await queryRunner.manager.findOne(UserDealPaymentEntity, {
        where: { id: paymentItem.payment.id },
        relations: ['user', 'payment_currency'],
      })

      if (!fullDealPayment) {
        // This should ideally not happen if paymentItem.payment was valid
        throw new NotFoundException(
          `UserDealPayment with id ${paymentItem.payment.id} not found during auction confirmation for points processing.`,
        )
      }

      if (fullDealPayment.points_used && fullDealPayment.points_used.isGreaterThan(0)) {
        await this.userPointsService.confirmPointRedemptionForDealPayment(
          fullDealPayment,
          queryRunner.manager,
        )
        this.logger.log(`Points redemption confirmed for auction payment ${fullDealPayment.id}`)
      }

      // 7. Allocate Stars for the deal purchase
      await this.starsService.addDealStars(paymentItem.id)

      // 8. Log wallet transaction history (Buyer and Seller)
      const currentPaymentItemForHistory = await queryRunner.manager.findOne(
        UserDealItemPaymentEntity,
        {
          where: { id: paymentItem.id },
          relations: [
            'payment',
            'payment.user',
            'payment.buyer_wallet',
            'payment.seller_wallet',
            'payment.payment_currency',
            'receiver',
            'sender',
          ],
        },
      )

      if (!currentPaymentItemForHistory || !currentPaymentItemForHistory.payment) {
        throw new NotFoundException(
          `Payment item or parent payment not found for history logging: ${paymentItem.id}`,
        )
      }
      const parentPaymentForHistory = currentPaymentItemForHistory.payment

      // Buyer's perspective: Deal Purchase Payment Sent
      if (parentPaymentForHistory.buyer_wallet && currentPaymentItemForHistory.sender) {
        const buyerHistoryDto: CreateWalletTransactionHistoryDto = {
          owner_user: currentPaymentItemForHistory.sender.id,
          affected_wallet: parentPaymentForHistory.buyer_wallet.id,
          transaction_type: WalletHistoryTransactionType.DEAL_PURCHASE_PAYMENT_SENT,
          flow_indicator: TransactionFlowIndicator.DEBIT,
          amount: parentPaymentForHistory.deal_amount.toString(),
          currency: parentPaymentForHistory.payment_currency.id,
          user_deal_payment: parentPaymentForHistory.id,
          user_deal_item_payment: currentPaymentItemForHistory.id,
          is_deal_purchase: true,
          receiver_user: currentPaymentItemForHistory.receiver.id,
          receiver_wallet: parentPaymentForHistory.seller_wallet?.id,
          sender_user: currentPaymentItemForHistory.sender.id,
          sender_wallet: parentPaymentForHistory.buyer_wallet?.id,
          transaction_timestamp: new Date(),
        }
        try {
          await this.walletTransactionHistoryService.create(buyerHistoryDto, queryRunner.manager)
        } catch (histError) {
          this.logger.error(
            `Failed to log buyer auction history for payment ${parentPaymentForHistory.id}: ${histError.message}`,
            histError.stack,
          )
        }
      } else {
        this.logger.warn(
          `Skipping buyer auction history for payment ${parentPaymentForHistory.id}: buyer_wallet or sender is missing.`,
        )
      }

      // Seller's perspective: Deal Sale Proceeds Received
      if (parentPaymentForHistory.seller_wallet && currentPaymentItemForHistory.receiver) {
        const sellerHistoryDto: CreateWalletTransactionHistoryDto = {
          owner_user: currentPaymentItemForHistory.receiver.id,
          affected_wallet: parentPaymentForHistory.seller_wallet.id,
          transaction_type: WalletHistoryTransactionType.DEAL_SALE_PROCEEDS_RECEIVED,
          flow_indicator: TransactionFlowIndicator.CREDIT,
          amount: parentPaymentForHistory.deal_amount.toString(),
          currency: parentPaymentForHistory.payment_currency.id,
          user_deal_payment: parentPaymentForHistory.id,
          user_deal_item_payment: currentPaymentItemForHistory.id,
          is_deal_sale: true,
          sender_user: currentPaymentItemForHistory.sender.id,
          sender_wallet: parentPaymentForHistory.buyer_wallet?.id,
          receiver_user: currentPaymentItemForHistory.receiver.id,
          receiver_wallet: parentPaymentForHistory.seller_wallet?.id,
          transaction_timestamp: new Date(),
        }
        try {
          await this.walletTransactionHistoryService.create(sellerHistoryDto, queryRunner.manager)
        } catch (histError) {
          this.logger.error(
            `Failed to log seller auction history for payment ${parentPaymentForHistory.id}: ${histError.message}`,
            histError.stack,
          )
        }
      } else {
        this.logger.warn(
          `Skipping seller auction history for payment ${parentPaymentForHistory.id}: seller_wallet or receiver is missing.`,
        )
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error(
        `Error in confirmAuctionPayment for item ${paymentItem.id}: ${error.message}`,
        error.stack,
      )
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
