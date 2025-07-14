import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import mailConfig from 'config/module/mail.module'
import { MailService } from './mail.service'

@Module({
  imports: [MailerModule.forRootAsync(mailConfig)],
  providers: [MailService, ConfigService],
  exports: [MailService],
})
export class MailModule {}
