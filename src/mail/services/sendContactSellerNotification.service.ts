import { IMailConfig } from '@app/src/shared/interfaces'
import { ContactSellerNotificationDto } from '@app/src/mail/dto'

export default async function (payload: ContactSellerNotificationDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  const emailSetting = mailConfig.subject.contactSellerNotification
  if (!emailSetting || !emailSetting.template) {
    console.error('Mail configuration for "contactSellerNotification" is missing or incomplete.')
    return
  }

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: payload.subject,
    template: emailSetting.template,
    context: payload,
  })
}
