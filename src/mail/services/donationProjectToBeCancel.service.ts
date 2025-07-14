import { IMailConfig } from '@app/src/shared/interfaces'
import { DonationProjectToBeCancelDto } from '@app/src/mail/dto'

export default async function (payload: DonationProjectToBeCancelDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.donationProjectToBeCancel.name,
    template: mailConfig.subject.donationProjectToBeCancel.template,
    context: payload,
  })
}
