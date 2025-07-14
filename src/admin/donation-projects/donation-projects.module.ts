import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { HistoryModule } from '@app/src/admin/donation-projects/history/history.module'
import { DonationProjectsService } from '@app/src/admin/donation-projects/donation-projects.service'
import { DonationProjectsController } from '@app/src/admin/donation-projects/donation-projects.controller'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { PaymentMethodModule } from '@app/src/users/payment-method/payment-method.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDonationsEntity, DonationProjectEntity]),
    HistoryModule,
    BlockchainModule,
    PaymentMethodModule,
  ],
  controllers: [DonationProjectsController],
  providers: [DonationProjectsService],
  exports: [DonationProjectsService],
})
export class DonationProjectsModule {}
