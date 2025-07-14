import { Module } from '@nestjs/common'
import { AdminRe2UserModule } from './user/user.module'
import { AdminRe2FundraiserModule } from './fundraiser/fundraiser.module'
import { AdminRe2IntegrationModule } from './integration/integration.module'

@Module({
  imports: [AdminRe2UserModule, AdminRe2IntegrationModule, AdminRe2FundraiserModule],
})
export class AdminRe2Module {}
