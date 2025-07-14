import { Queue } from 'bullmq'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { BullMqQuery } from '@app/src/shared/constant'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DonationsService } from '@app/src/donations/donations.service'
import { DealReviewService } from '@app/src/users/deal/review/review.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { DealRaffleEntity } from '@app/src/users/deal/entities/deal-raffle.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { RaffleWinnerEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-winner.entity'
import { RecurringDonationsService } from '@app/src/recurring-donations/recurring-donations.service'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import {
  showService,
  toCsvService,
  reviewService,
  suspendService,
  declineService,
  showOneService,
  userDealService,
  raffleWinnerService,
  deleteReviewService,
  purchaseHistoryService,
  toCSVRaffleWinnerService,
  calculateDonationService,
  changeRaffleWinnerService,
} from './services'
import { suspendAuctionMethod, suspendBuynowMethod, suspendRaffleMethod } from './services/methods'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'

@Injectable()
export class DealService extends MyService<DealEntity> {
  constructor(
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(RafflePurchaseEntity)
    private readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    @InjectRepository(DealRaffleEntity)
    private readonly raffleDealRepository: Repository<DealRaffleEntity>,
    @InjectRepository(DealVariantEntity)
    private readonly buynowRepository: Repository<DealVariantEntity>,
    private readonly systemFeeService: SystemFeeService,
    @InjectRepository(RaffleWinnerEntity)
    private readonly raffleWinnerRepository: Repository<RaffleWinnerEntity>,
    private readonly donationService: DonationsService,
    private readonly notificationService: NotificationsService,
    private readonly taskSchedulerService: TaskSchedulerService,
    @InjectQueue(BullMqQuery.USER_DEAL_QUEUE)
    private readonly dealQueue: Queue,
    @InjectRepository(ShippingProfileEntity)
    private readonly shippingProfileRepository: Repository<ShippingProfileEntity>,
    private readonly dealReviewService: DealReviewService,
    @InjectRepository(UserDealPaymentEntity)
    protected readonly userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    protected readonly userDealItemPaymentRepository: Repository<UserDealItemPaymentEntity>,
    private readonly recurringDonationService: RecurringDonationsService,
  ) {
    super(dealRepository, 'admin/deals')
  }

  private toCSV = toCsvService.bind(this)

  private suspendRaffleMethod = suspendRaffleMethod.bind(this)
  private suspendBuynowMethod = suspendBuynowMethod.bind(this)
  private suspendAuctionMethod = suspendAuctionMethod.bind(this)

  show = showService.bind(this)
  review = reviewService.bind(this)
  suspend = suspendService.bind(this)
  decline = declineService.bind(this)
  showOne = showOneService.bind(this)
  userDeal = userDealService.bind(this)
  raffleWinner = raffleWinnerService.bind(this)
  deleteReview = deleteReviewService.bind(this)
  purchaseHistory = purchaseHistoryService.bind(this)
  toCSVRaffleWinner = toCSVRaffleWinnerService.bind(this)
  calculateDonation = calculateDonationService.bind(this)
  changeRaffleWinner = changeRaffleWinnerService.bind(this)

  /**
   * Notify all participants of the deal in batches.
   *
   * @param {Array} users - Array of users who participated in the deal.
   * @param {Object} deal - The deal object.
   */
  notifyParticipants = async function (users, deal) {
    const batchSize = 10

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      await Promise.all(
        batch.map((user) =>
          this.notificationsService.create({
            title: 'The deal you participated in has been suspended by the admin.',
            user: user.id,
            type: NotificationType.DEAL_STATUS_CHANGED,
            receiver_type: NotificationReceiverType.USER,
            related_to: NotificationRelatedTo.DEAL,
            data: {
              deal: deal.id,
              deal_name: deal.name,
              seller: deal.user.display_name,
            },
          }),
        ),
      )
    }
  }
}
