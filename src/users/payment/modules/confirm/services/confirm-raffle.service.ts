import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { PurchaseStatus } from '@app/src/users/deal/raffle-purchase/enums/purchase-status.enum'
import { CreateWalletTransactionHistoryDto } from '@app/src/users/wallet-transaction-history/dto'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { ConfirmPaymentHelper } from '@app/src/users/payment/modules/confirm/helper/confirm-payment.helper'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { WalletTransactionHistoryService } from '@app/src/users/wallet-transaction-history/wallet-transaction-history.service'
import {
  TransactionFlowIndicator,
  WalletHistoryTransactionType,
} from '@app/src/users/wallet-transaction-history/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'

@Injectable()
export class ConfirmRafflePaymentService {
  private readonly logger = new Logger(ConfirmRafflePaymentService.name)

  constructor(
    @InjectRepository(RafflePurchaseEntity)
    protected readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    @InjectRepository(NotificationEntity)
    protected readonly notificationRepository: Repository<NotificationEntity>,
    protected readonly confirmPaymentHelper: ConfirmPaymentHelper,
    private readonly walletTransactionHistoryService: WalletTransactionHistoryService,
    private readonly entityManager: EntityManager,
    @InjectRepository(UserPointUpdatesEntity)
    protected readonly userPointUpdatesRepository: Repository<UserPointUpdatesEntity>,
    private readonly userPointsService: UserPointsService,
  ) {}

  confirmRafflePayment = async (paymentItem: UserDealItemPaymentEntity) => {
    const queryRunner = this.entityManager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      //  1. Update Raffle Purchase Entry
      if (!paymentItem.payment || !paymentItem.payment.raffle_purchase) {
        throw new NotFoundException(
          `Raffle purchase details not found for payment item ${paymentItem.id}`,
        )
      }
      const rafflePurchase = await queryRunner.manager.save(RafflePurchaseEntity, {
        id: paymentItem.payment.raffle_purchase.id,
        status: PurchaseStatus.ON_DEAL,
      })

      //  2. Mark the payment item and its donation/points as complete
      await this.confirmPaymentHelper.updatePayment(
        paymentItem.payment,
        paymentItem,
        rafflePurchase,
        { raffle: rafflePurchase.id },
      )

      // 2.1 Confirm point redemption if points were used
      const fullDealPayment = await queryRunner.manager.findOne(UserDealPaymentEntity, {
        where: { id: paymentItem.payment.id },
        relations: ['user', 'payment_currency'],
      })

      if (!fullDealPayment) {
        throw new NotFoundException(
          `UserDealPayment with id ${paymentItem.payment.id} not found during raffle confirmation for points processing.`,
        )
      }

      if (fullDealPayment.points_used && fullDealPayment.points_used.isGreaterThan(0)) {
        await this.userPointsService.confirmPointRedemptionForDealPayment(
          fullDealPayment,
          queryRunner.manager,
        )
        this.logger.log(`Points redemption confirmed for raffle payment ${fullDealPayment.id}`)
      }

      //  3. Notify the Seller about raffle purchase
      if (!paymentItem.receiver || !paymentItem.deal) {
        throw new NotFoundException(
          `Receiver or Deal details not found for notification on payment item ${paymentItem.id}`,
        )
      }
      const notification = this.notificationRepository.create({
        title: 'An entry has been purchased for your raffle',
        user: {
          id: paymentItem.receiver.id,
        },
        type: NotificationType.PURCHASE_RAFFLE_ENTRY,
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          deal: paymentItem.deal.id,
          deal_name: paymentItem.deal.name,
          username: paymentItem.receiver.username,
        },
      })
      await queryRunner.manager.save(NotificationEntity, notification)

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
            'payment.raffle_purchase',
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

      // Buyer's perspective: Raffle Entry Purchase Payment Sent
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
            `Failed to log buyer raffle history for payment ${parentPaymentForHistory.id}: ${histError.message}`,
            histError.stack,
          )
        }
      } else {
        this.logger.warn(
          `Skipping buyer raffle history for payment ${parentPaymentForHistory.id}: buyer_wallet or sender is missing.`,
        )
      }

      // Seller's perspective: Proceeds from Raffle Entry Sale
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
          receiver_user: currentPaymentItemForHistory.receiver.id,
          receiver_wallet: parentPaymentForHistory.seller_wallet?.id,
          sender_user: currentPaymentItemForHistory.sender.id,
          sender_wallet: parentPaymentForHistory.buyer_wallet?.id,
          transaction_timestamp: new Date(),
        }
        try {
          await this.walletTransactionHistoryService.create(sellerHistoryDto, queryRunner.manager)
        } catch (histError) {
          this.logger.error(
            `Failed to log seller raffle history for payment ${parentPaymentForHistory.id}: ${histError.message}`,
            histError.stack,
          )
        }
      } else {
        this.logger.warn(
          `Skipping seller raffle history for payment ${parentPaymentForHistory.id}: seller_wallet or receiver is missing.`,
        )
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      this.logger.error(
        `Error in confirmRafflePayment for item ${paymentItem.id}: ${error.message}`,
        error.stack,
      )
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
