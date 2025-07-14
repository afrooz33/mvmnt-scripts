import { Injectable } from '@nestjs/common'
import {
  RevertPaymentBuynowService,
  RevertPaymentAuctionService,
  RevertPaymentRaffleService,
} from './services'

@Injectable()
export class RevertPaymentService {
  constructor(
    protected readonly revertBuynowService: RevertPaymentBuynowService,
    protected readonly revertAuctionService: RevertPaymentAuctionService,
    protected readonly revertRaffleService: RevertPaymentRaffleService,
  ) {}

  revertBuynowPayment = this.revertBuynowService.revertBuynowPayment
  revertRafflePayment = this.revertRaffleService.revertRafflePayment
  revertAuctionPayment = this.revertAuctionService.revertAuctionPayment
}
