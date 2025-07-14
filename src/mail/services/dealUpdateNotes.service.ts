import { DealUpdateNotesDto } from '@app/src/mail/dto'
import { IMailConfig } from '@app/src/shared/interfaces'

export default async function (payload: DealUpdateNotesDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.dealUpdateNotes.name,
    template: mailConfig.subject.dealUpdateNotes.template,
    context: payload,
  })
}
