import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import { ReceiptService } from './receipt.service'
import { ReceiptController } from './receipt.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Re2UserEntity, UserDonationsEntity, RecurringDonationSettingsEntity]),
  ],
  controllers: [ReceiptController],
  providers: [ReceiptService],
})
export class ReceiptModule {}
