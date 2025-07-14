import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/re2/user/user.module'
import { ImagesModule } from '@app/src/images/images.module'
import { NonprofitUserModule } from '@app/src/nonprofit/user/nonprofit-user.module'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectsModule } from '@app/src/nonprofit/donation-projects/donation-projects.module'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { FundraiserEntity } from './entities/fundraisers.entity'
import { FundraiserController } from './fundraisers.controller'
import { FundraiserService } from './fundraisers.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([FundraiserEntity, NonprofitUserEntity, DonationProjectEntity]),
    UserModule,
    ImagesModule,
    NonprofitUserModule,
    DonationProjectsModule,
  ],
  controllers: [FundraiserController],
  providers: [FundraiserService],
  exports: [FundraiserService],
})
export class FundraisersModule {}
