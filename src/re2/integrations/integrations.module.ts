import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/re2/user/user.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { IntegrationsService } from './integrations.service'
import { IntegrationsController } from './integrations.controller'
import { IntegrationsEntity } from './entities/integrations.entity'
import { ShopifyIntegrationsEntity } from './entities/shopify-integration.entity'
import { ShopifySalePortionSettingEntity } from './entities/shopify-sale-portion-settings.entity'
import { ShopifyCartBannerSettingEntity } from './entities/shopify-cart-banner-settings.entity'
import { ShopifyCartDrawerSettingEntity } from './entities/shopify-cart-drawer-settings.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IntegrationsEntity,
      ShopifyIntegrationsEntity,
      ShopifyCartDrawerSettingEntity,
      ShopifyCartBannerSettingEntity,
      ShopifySalePortionSettingEntity,
    ]),
    UserModule,
    NonprofitUserModule,
    DonationProjectsModule,
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
