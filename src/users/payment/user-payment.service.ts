import { Injectable } from '@nestjs/common'
import { PaymentUpdateService } from './services'

@Injectable()
export class UserPaymentService {
  constructor(private readonly paymentUpdateService: PaymentUpdateService) {}

  updateTransactionHash = this.paymentUpdateService.updateTransactionHash
}
