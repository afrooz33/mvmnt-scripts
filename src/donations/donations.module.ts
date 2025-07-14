import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module, forwardRef } from '@nestjs/common'
import { UserModule } from '@app/src/users/user/user.module'
import { SystemFeeModule } from '@app/src/admin/system-fee/system-fee.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { RegionSettingsModule } from '@app/src/admin/region-settings/region_settings.module'
import { RecurringDonationsModule } from '@app/src/recurring-donations/recurring-donations.module'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { DonationsService } from './donations.service'
import { DonationsController } from './donations.controller'
import { UserDonationsEntity } from './entities/donations.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDonationsEntity]),
    UserModule,
    forwardRef(() => NonprofitUserModule),
    forwardRef(() => DonationProjectsModule),
    SystemFeeModule,
    RegionSettingsModule,
    RecurringDonationsModule,
  ],
  controllers: [DonationsController],
  providers: [DonationsService, ConfigService],
  exports: [DonationsService],
})
export class DonationsModule {}
