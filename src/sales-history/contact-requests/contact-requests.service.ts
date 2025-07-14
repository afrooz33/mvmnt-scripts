import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { MailService } from '@app/src/mail/mail.service'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { closeService } from '@app/src/purchase-history/contact-seller/services'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import { ContactSellerMessageEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-message.entity'
import { ContactSellerAttachmentEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-attachment.entity'
import { showService, showOneService, replyService } from './services'

@Injectable()
export class ContactRequestsService extends MyService<ContactSellerRequestEntity> {
  constructor(
    @InjectRepository(ContactSellerRequestEntity)
    private readonly requestRepository: Repository<ContactSellerRequestEntity>,
    @InjectRepository(ContactSellerMessageEntity)
    private readonly messageRepository: Repository<ContactSellerMessageEntity>,
    @InjectRepository(ContactSellerAttachmentEntity)
    private readonly attachmentRepository: Repository<ContactSellerAttachmentEntity>,
    @InjectRepository(ImagesEntity)
    private readonly imagesRepository: Repository<ImagesEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    super(requestRepository, 'sales-history/contact-requests')
  }

  show = showService.bind(this)
  reply = replyService.bind(this)
  close = closeService.bind(this)
  showOne = showOneService.bind(this)
}
