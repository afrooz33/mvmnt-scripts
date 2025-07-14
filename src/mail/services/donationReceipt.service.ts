import { IMailConfig } from '@app/src/shared/interfaces'
import { DonationReceiptDto } from '@app/src/mail/dto'

export default async function (payload: DonationReceiptDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.donationReceipt.name,
    template: mailConfig.subject.donationReceipt.template,
    context: payload,
  })
}
