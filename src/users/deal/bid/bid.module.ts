import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { DealModule } from '@app/src/users/deal/deal.module'
import { UserModule } from '@app/src/users/user/user.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { BidService } from './bid.service'
import { BidController } from './bid.controller'
import { BidEntity } from './entities/bid.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([BidEntity]),
    forwardRef(() => DealModule),
    UserModule,
    NotificationsModule,
    SystemFeeModule,
    DonationsModule,
    RegionSettingsModule,
    UserPointsModule,
  ],
  controllers: [BidController],
  exports: [BidService],
  providers: [BidService],
})
export class BidModule {}
