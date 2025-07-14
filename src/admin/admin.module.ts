import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { BannersModule } from './banners/banners.module'
import { DonationProjectsModule } from './donation-projects/donation-projects.module'
import { LanguagesModule } from './languages/languages.module'
import { NonprofitModule } from './nonprofit/nonprofit.module'
import { TagsModule } from './tags/tags.module'
import { BrandsModule } from './brands/brands.module'
import { ShippingMethodsModule } from './shipping-methods/shipping-methods.module'
import { GuidesModule } from './guides/guides.module'
import { DealModule } from './deals/deal.module'
import { UsersModule } from './users/users.module'
import { CouponsModule } from './coupons/coupons.module'
import { AdminProfileModule } from './profile/profile.module'
import { SystemFeeModule } from './system-fee/system-fee.module'
import { PaymentsModule } from './payments/payments.module'
import { HomepagesModule } from './homepages/homepages.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { RegionSettingsModule } from './region-settings/region_settings.module'
import { GeoModule } from './geo/geo.module'
import { TokensModule } from './tokens/tokens.module'
import { AdminRe2Module } from './re2/re2.module'
import { BrandTokensModule } from './brand-tokens/brand-tokens.module'
import { GovernanceModule } from './governance/governance.module'

@Module({
  imports: [
    AuthModule,
    BannersModule,
    DonationProjectsModule,
    LanguagesModule,
    NonprofitModule,
    TagsModule,
    DonationProjectsModule,
    BrandsModule,
    ShippingMethodsModule,
    GuidesModule,
    DealModule,
    UsersModule,
    CouponsModule,
    AdminProfileModule,
    SystemFeeModule,
    PaymentsModule,
    HomepagesModule,
    AnalyticsModule,
    RegionSettingsModule,
    GeoModule,
    TokensModule,
    AdminRe2Module,
    BrandTokensModule,
    GovernanceModule,
  ],
})
export class AdminModule {}
