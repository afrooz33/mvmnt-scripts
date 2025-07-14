import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { MailService } from '@app/src/mail/mail.service'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { ContactSellerRequestEntity } from './entities/contact-seller-request.entity'
import { ContactSellerMessageEntity } from './entities/contact-seller-message.entity'
import { ContactSellerAttachmentEntity } from './entities/contact-seller-attachment.entity'
import { showService, replyService, closeService, createService, showOneService } from './services'

@Injectable()
export class ContactSellerService extends MyService<ContactSellerRequestEntity> {
  constructor(
    @InjectRepository(ContactSellerRequestEntity)
    private readonly requestRepository: Repository<ContactSellerRequestEntity>,
    @InjectRepository(ContactSellerMessageEntity)
    private readonly messageRepository: Repository<ContactSellerMessageEntity>,
    @InjectRepository(ContactSellerAttachmentEntity)
    private readonly attachmentRepository: Repository<ContactSellerAttachmentEntity>,
    @InjectRepository(UserDealPaymentEntity)
    private readonly paymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(ImagesEntity)
    private readonly imagesRepository: Repository<ImagesEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    super(requestRepository, 'purchase-history/contact-seller')
  }

  show = showService.bind(this)
  reply = replyService.bind(this)
  close = closeService.bind(this)
  create = createService.bind(this)
  showOne = showOneService.bind(this)
}
