import { IMailConfig } from '@app/src/shared/interfaces'
import { EmailVerificationDto } from '@app/src/mail/dto'

export default async function (payload: EmailVerificationDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.emailVerification.name,
    template: mailConfig.subject.emailVerification.template,
    context: payload,
  })
}
