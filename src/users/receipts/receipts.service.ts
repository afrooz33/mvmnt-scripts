import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { MailService } from '@app/src/mail/mail.service'
import { UserService } from '@app/src/users/user/user.service'
import { BuynowService } from '@app/src/users/deal/buynow/buynow.service'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import {
  showService,
  showOneService,
  showHistoryService,
  raffleReceiptService,
  buynowReceiptService,
  showPaginatedService,
  auctionReceiptService,
} from './services'

@Injectable()
export class ReceiptsService extends MyService<UserDealItemPaymentEntity> {
  constructor(
    @InjectRepository(UserDealItemPaymentEntity)
    public readonly userDealItemPaymentRepository: Repository<UserDealItemPaymentEntity>,
    @InjectRepository(UserDealPaymentEntity)
    public readonly userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDonationsEntity)
    public readonly userDonationsRepository: Repository<UserDonationsEntity>,
    public readonly userService: UserService,
    public readonly buynowService: BuynowService,
    public readonly mailService: MailService,
    private readonly taskSchedulerService: TaskSchedulerService,
  ) {
    super(userDealItemPaymentRepository, 'user/receipts')
  }

  show = showService.bind(this)
  showOneService = showOneService.bind(this)
  showHistory = showHistoryService.bind(this)
  raffleReceipt = raffleReceiptService.bind(this)
  showPaginated = showPaginatedService.bind(this)
  buynowReceipt = buynowReceiptService.bind(this)
  auctionReceipt = auctionReceiptService.bind(this)

  /**
   * Show a single donation receipt, used in the receipt processor
   */
  showOne = showOneService.bind(this)
}
