import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { EmailChangeEntity } from './entities/email-change.entity'
import { MailService } from '@app/src/mail/mail.service'
import { createService, changeEmailService, resendService } from './services'

@Injectable()
export class EmailChangeService extends MyService<EmailChangeEntity> {
  constructor(
    @InjectRepository(EmailChangeEntity)
    private readonly emailChangeRepository: Repository<EmailChangeEntity>,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {
    super(emailChangeRepository, 'user/email-changes')
  }

  create = createService.bind(this)
  change = changeEmailService.bind(this)
  resend = resendService.bind(this)
}
