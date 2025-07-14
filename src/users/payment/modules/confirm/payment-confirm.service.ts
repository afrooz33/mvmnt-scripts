import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { DealType } from '@app/src/users/deal/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { ConfirmDealPaymentReq } from '@app/src/users/payment/modules/confirm/dto'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { DonationStarsService } from '@app/src/users/stars/services/donation-stars.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import {
  ConfirmRafflePaymentService,
  ConfirmBuynowPaymentService,
  ConfirmAuctionPaymentService,
} from './services'

@Injectable()
export class PaymentConfirmService {
  constructor(
    @InjectRepository(UserDealItemPaymentEntity)
    protected readonly userPaymentDealItemRepository: Repository<UserDealItemPaymentEntity>,
    @InjectRepository(RafflePurchaseEntity)
    protected readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    @InjectRepository(UserDealPaymentEntity)
    protected readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(NotificationEntity)
    protected readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(BidEntity)
    protected readonly bidRepository: Repository<BidEntity>,
    @InjectRepository(UserPointsEntity)
    protected readonly userPointsRepository: Repository<UserPointsEntity>,
    @InjectRepository(BuynowCartEntity)
    protected readonly cartRepository: Repository<BuynowCartEntity>,
    protected readonly userPointsService: UserPointsService,
    private readonly confirmBuynowPaymentService: ConfirmBuynowPaymentService,
    private readonly confirmRafflePaymentService: ConfirmRafflePaymentService,
    private readonly confirmAuctionPaymentService: ConfirmAuctionPaymentService,
    private readonly donationStarsService: DonationStarsService,
  ) {}

  confirmPayment = async (payload: ConfirmDealPaymentReq) => {
    //  1. Get the Payment Item and its parent payment
    const paymentItem: UserDealItemPaymentEntity = await this.userPaymentDealItemRepository.findOne(
      {
        where: {
          id: uuidFromUniqueId(payload.payment_id),
        },
        relations: {
          deal: true,
          payment: {
            cart: true,
            raffle_purchase: true,
            items: {
              donation: true,
              points: {
                updates: true,
              },
              sender: true,
              payment_currency: true,
            },
            payment_currency: true,
          },
          sender: true,
          receiver: true,
        },
      },
    )

    if (!paymentItem) {
      throw new NotFoundException(
        `Payment Item [${uuidFromUniqueId(payload.payment_id)}] does not exist`,
      )
    }

    //  2. Check if payment already processed
    if (paymentItem.status != PAYMENT_STATUS.INITIATED) {
      return {
        success: true,
        message: 'Payment Item already updated',
        data: {
          transactionId: paymentItem.payment.id,
          ...payload,
        },
      }
    }

    //  3. Handle confirmation based on deal type
    switch (paymentItem.payment.deal_type) {
      case DealType.AUCTION:
        await this.confirmAuctionPaymentService.confirmAuctionPayment(paymentItem)
        break
      case DealType.BUYNOW:
        await this.confirmBuynowPaymentService.confirmBuyNowPayment(
          paymentItem.payment,
          paymentItem.id,
        )
        break
      case DealType.RAFFLE:
        await this.confirmRafflePaymentService.confirmRafflePayment(paymentItem)
        break
    }

    return {
      success: true,
      message: 'Successfully processed paymentId',
      data: {
        transactionId: paymentItem.payment.id,
        ...payload,
      },
    }
  }
}
