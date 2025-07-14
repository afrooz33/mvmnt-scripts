import { Module } from '@nestjs/common'
import { AuthModule } from '@app/src/re2/auth/auth.module'
import { UserModule } from '@app/src/re2/user/user.module'
import { ReceiptModule } from './receipt/receipt.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { ProfileModule } from '@app/src/re2/profile/profile.module'
import { FundraisersModule } from './fundraisers/fundraisers.module'
import { IntegrationsModule } from './integrations/integrations.module'

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProfileModule,
    ReceiptModule,
    WebhooksModule,
    AnalyticsModule,
    FundraisersModule,
    IntegrationsModule,
  ],
})
export class Re2Module {}
