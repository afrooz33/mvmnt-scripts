import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserDonationsEntity, NonprofitUserEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
