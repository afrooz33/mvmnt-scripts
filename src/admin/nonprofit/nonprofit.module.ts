import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NonprofitService } from '@app/src/admin/nonprofit/nonprofit.service'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NonprofitController } from '@app/src/admin/nonprofit/nonprofit.controller'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { NonprofitProfileModule } from '@app/src/nonprofit/profile/nonprofit-profile.module'
import { HistoryModule } from '@app/src/admin/donation-projects/history/history.module'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([NonprofitProfileEntity, UserDonationsEntity, DonationProjectEntity]),
    NonprofitProfileModule,
    NonprofitUserModule,
    HistoryModule,
    BlockchainModule,
    PaymentMethodModule,
  ],
  controllers: [NonprofitController],
  providers: [NonprofitService],
})
export class NonprofitModule {}
