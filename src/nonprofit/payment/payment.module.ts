import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DonationsModule } from '@app/src/donations/donations.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserDonationsEntity]), DonationsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
