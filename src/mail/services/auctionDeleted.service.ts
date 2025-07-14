import { AuctionDeletedDto } from '@app/src/mail/dto'
import { IMailConfig } from '@app/src/shared/interfaces'

export default async function (payload: AuctionDeletedDto): Promise<any> {
  const mailConfig: IMailConfig = this.configService.get('mail')

  return await this.mailerService.sendMail({
    to: payload.email,
    subject: mailConfig.subject.auctionDeleted.name,
    template: mailConfig.subject.auctionDeleted.template,
    context: payload,
  })
}
