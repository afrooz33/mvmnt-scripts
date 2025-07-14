import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@app/src/mail/mail.module'
import { UserModule } from '@app/src/users/user/user.module'
import { EmailChangeEntity } from './entities/email-change.entity'
import { EmailChangeController } from './email-change.controller'
import { EmailChangeService } from './email-change.service'

@Module({
  imports: [TypeOrmModule.forFeature([EmailChangeEntity]), MailModule, UserModule],
  controllers: [EmailChangeController],
  providers: [EmailChangeService],
})
export class EmailChangeModule {}
