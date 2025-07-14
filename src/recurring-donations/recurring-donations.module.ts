import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { UserDonationsModule } from '@app/src/donations/user-donations.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'
import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import { RecurringDonationsService } from './recurring-donations.service'
import { UserRecurringDonationsController, AdminRecurringDonationsController } from './controllers'
import {
  CancelRecurringService,
  ExecuteRecurringService,
  CancelSingleRecurringService,
  RegisterRecurringDealService,
  RegisterRecurringDirectService,
} from './services'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DealEntity,
      NotificationEntity,
      TokenWhitelistEntity,
      DonationProjectEntity,
      RecurringDonationSettingsEntity,
      RecurringDonationSignaturesEntity,
    ]),
    ConfigModule,
    BlockchainModule,
    NotificationsModule,
    UserDonationsModule,
    PaymentMethodModule,
  ],
  controllers: [UserRecurringDonationsController, AdminRecurringDonationsController],
  providers: [
    RecurringDonationsService,
    ExecuteRecurringService,
    CancelRecurringService,
    RegisterRecurringDealService,
    RegisterRecurringDirectService,
    CancelSingleRecurringService,
  ],
  exports: [RecurringDonationsService, ExecuteRecurringService],
})
export class RecurringDonationsModule {}
