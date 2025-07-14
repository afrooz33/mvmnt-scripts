import { IMailConfig } from '@app/src/shared/interfaces'
import { Re2UserAccountStatusUpdatedDto } from '@app/src/mail/dto'

export default async function (payload: Re2UserAccountStatusUpdatedDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.re2UserAccountStatusUpdated.name,
    template: mailConfig.subject.re2UserAccountStatusUpdated.template,
    context: payload,
  })
}
