import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { POINTS_STATUS } from '@app/src/users/points/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { RevertDealPaymentDto } from '@app/src/users/payment/modules/revert/dto'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'

@Injectable()
export class RevertPaymentBuynowService {
  constructor(
    @InjectRepository(UserDealItemPaymentEntity)
    protected readonly userPaymentDealItemRepository: Repository<UserDealItemPaymentEntity>,
    @InjectRepository(UserDealPaymentEntity)
    protected readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(BuynowCartEntity)
    protected readonly cartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    protected readonly cartItemRepository: Repository<BuynowCartItemEntity>,
    @InjectRepository(DealEntity)
    protected readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(RafflePurchaseEntity)
    protected readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    @InjectRepository(NotificationEntity)
    protected readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(BidEntity)
    protected readonly bidRepository: Repository<BidEntity>,
    private readonly blockchainService: BlockchainService,
  ) {}

  revertBuynowPayment = async (
    payload: RevertDealPaymentDto,
    userId: string,
  ): Promise<SuccessRO> => {
    //  1. Get Payment details
    const payment = await this.userPaymentDealRepository.findOne({
      where: {
        id: payload.payment,
        status: PAYMENT_STATUS.INITIATED,
        user: {
          id: userId,
        },
      },
      relations: [
        Query.ITEMS,
        `${Query.ITEMS}.${Query.POINTS}`,
        `${Query.ITEMS}.${Query.DONATION}`,
        `${Query.CART}`,
      ],
    })
    if (!payment) {
      throw new NotFoundException(ErrorKey.PAYMENT_NOT_FOUND)
    }

    //  2. Verify the Transaction is Reverted on Blockchain
    try {
      const blockchainVerified = await this.blockchainService.isTransactionReverted(
        payment.transaction_hash,
      )
      if (!blockchainVerified) throw new BadRequestException(ErrorKey.TRANSACTION_NOT_REVERTED)
    } catch (err) {
      throw new BadRequestException(ErrorKey.TRANSACTION_HASH_INVALID)
    }

    // 3. Revert payment, donations and Points for each payment Item
    payment.status = PAYMENT_STATUS.REVERTED

    for (let i = 0; i < payment.items.length; i += 1) {
      payment.items[i].status = PAYMENT_STATUS.REVERTED
      payment.items[i].donation.status = DONATION_STATUS.REVERTED
      for (let j = 0; j < payment.items[i].points.length; j += 1) {
        payment.items[i].points[j].status = POINTS_STATUS.REVERTED
      }
    }

    await this.cartRepository.update(
      {
        id: payment.cart.id,
      },
      {
        status: CartStatus.PENDING,
      },
    )

    await payment.save()

    return {
      data: payload,
      message: 'Payment successfully reverted',
      success: true,
    }
  }
}
