import { IMailConfig } from '@app/src/shared/interfaces'
import { FundraiserPageSuspendedDto } from '@app/src/mail/dto'

export default async function (payload: FundraiserPageSuspendedDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.fundraiserPageSuspended.name,
    template: mailConfig.subject.fundraiserPageSuspended.template,
    context: payload,
  })
}
