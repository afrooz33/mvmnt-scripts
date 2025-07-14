import { Injectable } from '@nestjs/common'
import {
  InitiateRafflePaymentService,
  InitiateBuynowPaymentService,
  InitiateAuctionPaymentService,
} from './services'

@Injectable()
export class PaymentInitiateService {
  constructor(
    protected readonly initiateRafflePaymentService: InitiateRafflePaymentService,
    protected readonly initiateBuynowPaymentService: InitiateBuynowPaymentService,
    protected readonly initiateAuctionPaymentService: InitiateAuctionPaymentService,
  ) {}

  initiateRafflePayment = this.initiateRafflePaymentService.initiateRafflePayment
  initiateBuynowPayment = this.initiateBuynowPaymentService.initiateBuynowPayment
  initiateAuctionPayment = this.initiateAuctionPaymentService.initiateAuctionPayment
}
