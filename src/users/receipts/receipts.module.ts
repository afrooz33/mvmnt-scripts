import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullMqQuery } from '@app/src/shared/constant'
import { MailModule } from '@app/src/mail/mail.module'
import { UserModule } from '@app/src/users/user/user.module'
import { BuynowModule } from '@app/src/users/deal/buynow/buynow.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { ReceiptProcessor } from './processor'
import { ReceiptSchedulerService } from './scheduler'
import { ReceiptsService } from './receipts.service'
import { ReceiptsController } from './receipts.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserDonationsEntity,
      UserDealPaymentEntity,
      UserDealItemPaymentEntity,
    ]),
    MailModule,
    UserModule,
    BuynowModule,
    TaskSchedulerModule,
    BullModule.registerQueue({
      name: BullMqQuery.DONATION_RECEIPT_QUEUE,
    }),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptProcessor, ReceiptSchedulerService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
