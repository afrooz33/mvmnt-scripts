import { IMailConfig } from '@app/src/shared/interfaces'
import { ForgotPasswordDto } from '@app/src/mail/dto'

export default async function (payload: ForgotPasswordDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.forgotPassword.name,
    template: mailConfig.subject.forgotPassword.template,
    context: payload,
  })
}
