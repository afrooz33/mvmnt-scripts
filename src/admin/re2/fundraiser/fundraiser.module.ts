import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@app/src/mail/mail.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { FundraiserController } from './fundraiser.controller'
import { FundraiserService } from './fundraiser.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([FundraiserEntity, UserDonationsEntity]),
    MailModule,
    DonationsModule,
  ],
  controllers: [FundraiserController],
  providers: [FundraiserService],
  exports: [FundraiserService],
})
export class AdminRe2FundraiserModule {}
