import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import {
  changeEmailService,
  forgotPasswordService,
  auctionDeletedService,
  dealUpdateNotesService,
  donationReceiptService,
  emailVerificationService,
  fundraiserPageSuspendedService,
  fundraiserPageReactivatedService,
  donationProjectToBeCancelService,
  fundraiserFormStatusUpdateService,
  re2UserAccountStatusUpdatedService,
  sendContactSellerNotificationService,
  nonprofitUserAccountVerificationService,
} from './services'

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  changeEmail = changeEmailService.bind(this)
  forgotPassword = forgotPasswordService.bind(this)
  auctionDeleted = auctionDeletedService.bind(this)
  donationReceipt = donationReceiptService.bind(this)
  dealUpdateNotes = dealUpdateNotesService.bind(this)
  emailVerification = emailVerificationService.bind(this)
  fundraiserPageSuspended = fundraiserPageSuspendedService.bind(this)
  fundraiserPageReactivated = fundraiserPageReactivatedService.bind(this)
  donationProjectToBeCancel = donationProjectToBeCancelService.bind(this)
  fundraiserFormStatusUpdate = fundraiserFormStatusUpdateService.bind(this)
  re2UserAccountStatusUpdated = re2UserAccountStatusUpdatedService.bind(this)
  sendContactSellerNotification = sendContactSellerNotificationService.bind(this)
  nonprofitUserAccountVerification = nonprofitUserAccountVerificationService.bind(this)
}
