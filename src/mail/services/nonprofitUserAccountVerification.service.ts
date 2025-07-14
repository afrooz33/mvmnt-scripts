import { IMailConfig } from '@app/src/shared/interfaces'
import { NonprofitUserAccountVerificationDto } from '@app/src/mail/dto'

export default async function (payload: NonprofitUserAccountVerificationDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.nonprofitUserAccountVerification.name,
    template: mailConfig.subject.nonprofitUserAccountVerification.template,
    context: payload,
  })
}
