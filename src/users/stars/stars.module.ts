import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { InvitationEntity } from '@app/src/users/invitation/entities/invitation.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { StarsService } from './stars.service'
import { UserStarsEntity } from './entities/stars.entity'
import { ContributionStarsService, DealStarsService, DonationStarsService } from './services'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserStarsEntity,
      UserDealPaymentEntity,
      UserDonationPaymentEntity,
      InvitationEntity,
    ]),
    UserModule,
    DealModule,
  ],
  providers: [StarsService, ContributionStarsService, DonationStarsService, DealStarsService],
  exports: [StarsService, DonationStarsService],
})
export class StarsModule {}
