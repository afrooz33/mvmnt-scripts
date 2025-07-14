import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@app/src/mail/mail.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { AdminRe2FundraiserModule } from '@app/src/admin/re2/fundraiser/fundraiser.module'
import { AdminRe2IntegrationModule } from '@app/src/admin/re2/integration/integration.module'
import { Re2UserService } from './user.service'
import { Re2UserController } from './user.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Re2UserEntity]),
    MailModule,
    DonationsModule,
    AdminRe2FundraiserModule,
    AdminRe2IntegrationModule,
  ],
  controllers: [Re2UserController],
  providers: [Re2UserService],
})
export class AdminRe2UserModule {}
