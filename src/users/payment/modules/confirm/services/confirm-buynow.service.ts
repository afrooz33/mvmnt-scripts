import { DateTime } from 'luxon'
import BigNumber from 'bignumber.js'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Repository, EntityManager, Not } from 'typeorm'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import {
  TransactionFlowIndicator,
  WalletHistoryTransactionType,
} from '@app/src/users/wallet-transaction-history/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { ResellingEventType } from '@app/src/users/reselling/enums'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { TransactionType } from '@app/src/users/payment/modules/confirm/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { InventoryService } from '@app/src/sales-history/shipping/inventory.service'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { POINTS_REASON, POINTS_STATUS, POINTS_TYPE } from '@app/src/users/points/enums'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { CreateWalletTransactionHistoryDto } from '@app/src/users/wallet-transaction-history/dto'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { ConfirmPaymentHelper } from '@app/src/users/payment/modules/confirm/helper/confirm-payment.helper'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { OrderOriginReservationEntity } from '@app/src/sales-history/shipping/entities/order-origin-reservations.entity'
import { WalletTransactionHistoryService } from '@app/src/users/wallet-transaction-history/wallet-transaction-history.service'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

@Injectable()
export class ConfirmBuynowPaymentService {
  private readonly logger = new Logger(ConfirmBuynowPaymentService.name)

  constructor(
    @InjectRepository(UserDealPaymentEntity)
    protected readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    protected readonly userPaymentDealItemRepository: Repository<UserDealItemPaymentEntity>,
    @InjectRepository(UserPointsEntity)
    protected readonly userPointsRepository: Repository<UserPointsEntity>,
    @InjectRepository(BuynowCartEntity)
    protected readonly cartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(UserPointUpdatesEntity)
    protected readonly userPointUpdatesRepository: Repository<UserPointUpdatesEntity>,
    protected readonly blockchainService: BlockchainService,
    protected readonly userPointsService: UserPointsService,
    protected readonly confirmPaymentHelper: ConfirmPaymentHelper,
    private readonly eventEmitter: EventEmitter2,
    private readonly inventoryService: InventoryService,
    @InjectRepository(OrderOriginReservationEntity)
    private readonly reservationRepository: Repository<OrderOriginReservationEntity>,
    @InjectRepository(DealVariantInventoryEntity)
    private readonly dealVariantInventoryRepository: Repository<DealVariantInventoryEntity>,
    @InjectRepository(NotificationEntity)
    protected readonly notificationRepository: Repository<NotificationEntity>,
    private readonly entityManager: EntityManager,
    private readonly walletTransactionHistoryService: WalletTransactionHistoryService,
  ) {}

  confirmBuyNowPayment = async (payment: UserDealPaymentEntity, itemId: string) => {
    const fullPayment = await this.userPaymentDealRepository.findOne({
      where: { id: payment.id },
      relations: [
        'user',
        'payment_currency',
        'items',
        'items.donation',
        'items.points',
        'items.points.updates',
        'items.deal',
        'items.deal_variant',
        'items.reselling_link',
        'items.payment_currency',
        'items.sender',
        'items.receiver',
        'cart',
        'buyer_wallet',
        'seller_wallet',
      ],
    })

    if (!fullPayment) {
      throw new NotFoundException(`Payment [${payment.id}] not found for confirmation.`)
    }

    const queryRunner = this.entityManager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const paymentItem = await queryRunner.manager.findOne(UserDealItemPaymentEntity, {
        where: { id: itemId, payment: { id: fullPayment.id } },
        relations: [
          'donation',
          'points',
          'points.updates',
          'payment',
          'payment.cart',
          'payment.buyer_wallet',
          'payment.seller_wallet',
          'deal',
          'deal_variant',
          'reselling_link',
          'payment_currency',
          'sender',
          'receiver',
        ],
        select: {
          id: true,
          status: true,
          quantity: true,
          fiat_currency_symbol: true,
          payment_currency_symbol: true,
          deal_amount: true as any,
          donation: {
            id: true,
            status: true,
            gas_fees: true as any,
          },
          points: {
            id: true,
            status: true,
            updates: {
              id: true,
              status: true,
              notes: true as any,
            },
          },
          payment: {
            id: true,
            status: true,
            transaction_hash: true,
            points_used: true as any,
            user: { id: true },
            payment_currency: { id: true, name: true, address: true },
            buyer_wallet: {
              id: true,
              address: true,
            },
            seller_wallet: {
              id: true,
              address: true,
            },
            cart: {
              id: true,
              total: true,
              status: true,
              purchase_date: true,
              return_deadline: true,
            },
            items: {
              id: true,
              status: true,
              gas_fees: true as any,
              donation: { id: true, gas_fees: true as any },
            },
          },
          deal: {
            id: true,
            name: true,
            deal_type: true,
            donation_type: true,
            donation_amount: true,
          },
          deal_variant: {
            id: true,
            price: true,
          },
          reselling_link: {
            id: true,
          },
          payment_currency: {
            id: true,
            name: true,
            address: true,
          },
          sender: {
            id: true,
            username: true,
            account_type: true,
          },
          receiver: {
            id: true,
            username: true,
          },
        },
      })

      if (!paymentItem) {
        throw new NotFoundException(
          `Payment Item [${itemId}] does not exist for payment [${fullPayment.id}]`,
        )
      }

      paymentItem.donation.status = DONATION_STATUS.COMPLETED
      paymentItem.status = PAYMENT_STATUS.COMPLETED

      for (let j = 0; j < paymentItem.points.length; j += 1) {
        const pointUpdateEntity = queryRunner.manager.create(UserPointUpdatesEntity, {
          status: POINTS_STATUS.UNLOCKED,
          notes: paymentItem.points[j].updates.at(-1)?.notes || {},
          user_point: paymentItem.points[j],
        })
        paymentItem.points[j].status = POINTS_STATUS.UNLOCKED
        await queryRunner.manager.save(UserPointsEntity, paymentItem.points[j])
        await queryRunner.manager.save(UserPointUpdatesEntity, pointUpdateEntity)
      }

      await queryRunner.manager.save(UserDealItemPaymentEntity, paymentItem)

      let isCompleted = true
      const allPaymentItems = await queryRunner.manager.find(UserDealItemPaymentEntity, {
        where: { payment: { id: fullPayment.id } },
        select: ['id', 'status'],
      })

      for (const item of allPaymentItems) {
        if (item.status !== PAYMENT_STATUS.COMPLETED) {
          isCompleted = false
          break
        }
      }

      if (!isCompleted) {
        await queryRunner.commitTransaction()
        return
      }

      const gasFees: BigNumber = await this.blockchainService.getGasFees(
        fullPayment.transaction_hash,
      )
      fullPayment.status = PAYMENT_STATUS.COMPLETED
      fullPayment.gas_fees = gasFees

      const gasDivision = gasFees.dividedBy(allPaymentItems.length)
      let remainingGas: BigNumber = gasFees

      for (let i = 0; i < allPaymentItems.length; i += 1) {
        const currentItemInLoop = await queryRunner.manager.findOne(UserDealItemPaymentEntity, {
          where: { id: allPaymentItems[i].id },
          relations: ['donation'],
        })
        if (!currentItemInLoop) continue

        const allocatedGas: BigNumber =
          i === allPaymentItems.length - 1 ? remainingGas : gasDivision
        currentItemInLoop.gas_fees = allocatedGas
        if (currentItemInLoop.donation) {
          currentItemInLoop.donation.gas_fees = allocatedGas
          await queryRunner.manager.save(currentItemInLoop.donation)
        }
        remainingGas = remainingGas.minus(gasDivision)
        await queryRunner.manager.save(UserDealItemPaymentEntity, currentItemInLoop)
      }

      await queryRunner.manager.save(UserDealPaymentEntity, fullPayment)

      if (fullPayment.points_used && fullPayment.points_used.isGreaterThan(0)) {
        try {
          await this.userPointsService.confirmPointRedemptionForDealPayment(
            fullPayment,
            queryRunner.manager,
          )
        } catch (error) {
          throw error
        }
      }

      const cartId = fullPayment.cart.id
      const reservations = await queryRunner.manager.find(OrderOriginReservationEntity, {
        where: { cart: { id: cartId }, expires_at: Not(null) },
        relations: ['inventory'],
      })

      for (const reservation of reservations) {
        reservation.expires_at = null
        await queryRunner.manager.save(OrderOriginReservationEntity, reservation)
      }

      if (paymentItem.deal_variant) {
        const dealVariantInventory = await queryRunner.manager.findOne(DealVariantInventoryEntity, {
          where: { variant: { id: paymentItem.deal_variant.id } },
        })
        if (dealVariantInventory) {
          dealVariantInventory.quantity =
            Number(dealVariantInventory.quantity) - Number(paymentItem.quantity)
          await queryRunner.manager.save(DealVariantInventoryEntity, dealVariantInventory)
        }
      }

      const gasPointsUser = paymentItem.sender
      const gasPointsPaymentCurrency = paymentItem.payment_currency

      if (gasPointsUser && gasPointsPaymentCurrency) {
        const userPointsGasRefund: number = await this.confirmPaymentHelper.calculateGASRefund(
          gasFees,
          TransactionType.DEAL,
          gasPointsPaymentCurrency.id,
        )

        const gasPointsEntity = queryRunner.manager.create(UserPointsEntity, {
          user: gasPointsUser,
          payment_points: paymentItem,
          reason: POINTS_REASON.DEAL,
          amount: userPointsGasRefund,
          remaining: userPointsGasRefund,
          status: POINTS_STATUS.UNLOCKED,
          withdraw_currency: gasPointsPaymentCurrency,
          type: POINTS_TYPE.GAS,
          delivery_date: this.userPointsService.getPointsDeliveryDate(),
          expiry_date: this.userPointsService.getPointsExpiryDate(gasPointsUser.account_type),
        })
        await queryRunner.manager.save(UserPointsEntity, gasPointsEntity)
      }

      await queryRunner.manager.update(
        BuynowCartEntity,
        { id: cartId },
        {
          status: CartStatus.WAITING_SHIPMENT,
          purchase_date: DateTime.now().toJSDate(),
          return_deadline: DateTime.now().plus({ days: 16 }).toJSDate(),
        },
      )

      const notification = queryRunner.manager.create(NotificationEntity, {
        title: 'A Buy Now Deal has been purchased',
        user: {
          id: paymentItem.sender.id,
        },
        type: NotificationType.BUYNOW_DEAL_PURCHASED,
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          deal: paymentItem.deal.id,
          deal_name: paymentItem.deal.name,
          username: paymentItem.sender.username,
        },
      })
      await queryRunner.manager.save(NotificationEntity, notification)

      this.eventEmitter.emit('user.award.deal.stars', fullPayment.id)

      if (paymentItem?.reselling_link?.id) {
        this.eventEmitter.emit('reselling.event.track', {
          type: ResellingEventType.PURCHASE,
          reselling_link_id: paymentItem.reselling_link.id,
          user_id: paymentItem.sender.id,
          deal_id: paymentItem.deal.id,
          payment_item_id: paymentItem.id,
        })
      }

      if (fullPayment.buyer_wallet && paymentItem.sender && fullPayment.payment_currency) {
        const buyerHistoryDto: CreateWalletTransactionHistoryDto = {
          owner_user: paymentItem.sender.id,
          affected_wallet: fullPayment.buyer_wallet.id,
          transaction_type: WalletHistoryTransactionType.DEAL_PURCHASE_PAYMENT_SENT,
          flow_indicator: TransactionFlowIndicator.DEBIT,
          amount: paymentItem.deal_amount.toString(),
          currency: fullPayment.payment_currency.id,
          user_deal_payment: fullPayment.id,
          user_deal_item_payment: paymentItem.id,
          is_deal_purchase: true,
          sender_user: paymentItem.sender.id,
          sender_wallet: fullPayment.buyer_wallet?.id,
          receiver_user: paymentItem.receiver.id,
          receiver_wallet: fullPayment.seller_wallet?.id,
          transaction_timestamp: new Date(),
        }

        try {
          await this.walletTransactionHistoryService.create(buyerHistoryDto)
        } catch (histError) {
          this.logger.error(
            `Failed to log buyer wallet history for payment ${paymentItem.payment.id}: ${histError.message}`,
            histError.stack,
          )
        }
      } else {
        this.logger.warn(
          `Skipping buyer wallet history for payment ${paymentItem.payment.id}: buyer_wallet or paymentItem.sender is missing.`,
        )
      }

      if (fullPayment.seller_wallet && paymentItem.receiver && fullPayment.payment_currency) {
        const sellerHistoryDto: CreateWalletTransactionHistoryDto = {
          owner_user: paymentItem.receiver.id,
          affected_wallet: fullPayment.seller_wallet.id,
          transaction_type: WalletHistoryTransactionType.DEAL_SALE_PROCEEDS_RECEIVED,
          flow_indicator: TransactionFlowIndicator.CREDIT,
          amount: paymentItem.deal_amount.toString(),
          currency: fullPayment.payment_currency.id,
          user_deal_payment: fullPayment.id,
          user_deal_item_payment: paymentItem.id,
          is_deal_sale: true,
          receiver_user: paymentItem.receiver.id,
          receiver_wallet: fullPayment.seller_wallet?.id,
          sender_user: paymentItem.sender.id,
          sender_wallet: fullPayment.buyer_wallet?.id,
          transaction_timestamp: new Date(),
        }
        try {
          await this.walletTransactionHistoryService.create(sellerHistoryDto)
        } catch (histError) {
          this.logger.error(
            `Failed to log seller wallet history for payment ${paymentItem.payment.id}: ${histError.message}`,
            histError.stack,
          )
        }
      } else {
        this.logger.warn(
          `Skipping seller wallet history for payment ${paymentItem.payment.id}: seller_wallet or paymentItem.receiver is missing.`,
        )
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
