import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { UserDonationsModule } from '@app/src/donations/user-donations.module'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { WebhooksController } from './webhooks.controller'
import { WebhooksServices } from './webhooks.services'
import { ShopifyOrderEntity } from './entities/shopify-order.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ShopifyOrderEntity, NonprofitUserEntity, DonationProjectEntity]),
    UserModule,
    UserPointsModule,
    UserDonationsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksServices],
  exports: [WebhooksServices],
})
export class WebhooksModule {}
