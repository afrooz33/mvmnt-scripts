import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { PaymentUpdateService } from './services'
import { UserPaymentService } from './user-payment.service'
import { UserPaymentController } from './user-payment.controller'
import { UserDealPaymentEntity } from './entities/user-deal-payment.entity'
import { PaymentConfirmModule } from './modules/confirm/payment-confirm.module'
import { PaymentRevertModule } from './modules/revert/revert-payment.module'
import { PaymentInitiateModule } from './modules/initiate/payment-initiate.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDealPaymentEntity]),
    PaymentInitiateModule,
    PaymentRevertModule,
    PaymentConfirmModule,
    SystemFeeModule,
  ],
  providers: [PaymentUpdateService, UserPaymentService],
  exports: [],
  controllers: [UserPaymentController],
})
export class UserPaymentModule {}
