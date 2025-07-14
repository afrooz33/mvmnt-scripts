import { join } from 'path'
import { Module } from '@nestjs/common'
import { I18nModule } from 'nestjs-i18n'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'
import { CacheModule } from '@nestjs/cache-manager'
import { ServeStaticModule } from '@nestjs/serve-static'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { i18nConfig, rootConfig, dbConfig, bullMqConfig } from '@app/config'
import { HttpExceptionProvider, LoggingProvider } from '@app/shared/providers'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { Re2Module } from '@app/src/re2/re2.module'
import { TagsModule } from '@app/src/tags/tags.module'
import { CronModule } from '@app/src/crons/cron.module'
import { UsersModule } from '@app/src/users/users.module'
import { AdminModule } from '@app/src/admin/admin.module'
import { ImagesModule } from '@app/src/images/images.module'
import { NonprofitModule } from '@app/src/nonprofit/nonprofit.module'
import { LanguagesModule } from '@app/src/languages/languages.module'
import { TaskSchedulerModule } from '@app/src/task-scheduler/task-scheduler.module'
import { CouponsModule } from '@app/src/coupons/coupons.module'
import { NotificationsModule } from './notifications/notifications.module'
import { DonationsModule } from './donations/donations.module'
import { HomepagesModule } from './homepages/homepages.module'
import { BannersModule } from './banners/banners.module'
import { ShippingMethodsModule } from './shipping-methods/shipping-methods.module'
import { GeoModule } from './geo/geo.module'
import { DrawerSettingsModule } from './shopify/drawer-settings/drawer-settings.module'
import { ResellingModule } from './users/reselling/reselling.module'
import { RecurringDonationsModule } from './recurring-donations/recurring-donations.module'
import { UserDonationsModule } from './donations/user-donations.module'
import { GuidesModule } from './guides/guides.module'
import { TransactionProcessorModule } from './transaction-processor/transaction-processor.module'
import { PurchaseHistoryModule } from './purchase-history/purchase-history.module'
import { SalesHistoryModule } from './sales-history/sales-history.module'
import { BrandTokensModule } from './brand-tokens/brand-tokens.module'
import { HealthModule } from './health/health.module'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    I18nModule.forRoot(i18nConfig),
    ConfigModule.forRoot(rootConfig),
    TypeOrmModule.forRootAsync(dbConfig),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
    }),
    DonationProjectsModule,
    ImagesModule,
    NonprofitModule,
    ScheduleModule.forRoot(),
    CronModule,
    LanguagesModule,
    AdminModule,
    UsersModule,
    Re2Module,
    TagsModule,
    BullModule.forRoot(bullMqConfig),
    TaskSchedulerModule,
    CouponsModule,
    NotificationsModule,
    DonationsModule,
    HomepagesModule,
    BannersModule,
    ShippingMethodsModule,
    GeoModule,
    DrawerSettingsModule,
    EventEmitterModule.forRoot(),
    ResellingModule,
    RecurringDonationsModule,
    UserDonationsModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
      max: 100,
    }),
    GuidesModule,
    TransactionProcessorModule,
    PurchaseHistoryModule,
    SalesHistoryModule,
    BrandTokensModule,
    HealthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  providers: [
    LoggingProvider,
    HttpExceptionProvider,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
