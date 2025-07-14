import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FundraisersModule } from '@app/src/re2/fundraisers/fundraisers.module'
import { IntegrationsModule } from '@app/src/re2/integrations/integrations.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { ShopifyIntegrationsEntity } from '@app/src/re2/integrations/entities/shopify-integration.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FundraiserEntity,
      ShopifyIntegrationsEntity,
      NonprofitUserEntity,
      UserDonationsEntity,
      DonationProjectEntity,
    ]),
    FundraisersModule,
    IntegrationsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
