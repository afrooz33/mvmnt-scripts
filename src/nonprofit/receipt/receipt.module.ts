import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import { ReceiptController } from './receipt.controller'
import { ReceiptService } from './receipt.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDonationsEntity, RecurringDonationSettingsEntity]),
    DonationsModule,
    UserModule,
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {}
