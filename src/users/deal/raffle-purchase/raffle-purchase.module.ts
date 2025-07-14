import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { DealModule } from '@app/src/users/deal/deal.module'
import { UserModule } from '@app/src/users/user/user.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { DealRaffleEntity } from '@app/src/users/deal/entities/deal-raffle.entity'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { RafflePurchaseService } from './raffle-purchase.service'
import { RaffleWinnerEntity } from './entities/raffle-winner.entity'
import { RafflePurchaseController } from './raffle-purchase.controller'
import { RafflePurchaseEntity } from './entities/raffle-purchase.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DealRaffleEntity,
      RaffleWinnerEntity,
      RafflePurchaseEntity,
      UserDealItemPaymentEntity,
    ]),
    forwardRef(() => DealModule),
    UserModule,
    NotificationsModule,
    SystemFeeModule,
    forwardRef(() => DonationsModule),
    RegionSettingsModule,
    UserPointsModule,
  ],
  controllers: [RafflePurchaseController],
  providers: [RafflePurchaseService],
})
export class RafflePurchaseModule {}
