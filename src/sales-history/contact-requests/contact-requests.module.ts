import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@app/src/mail/mail.module'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import { ContactSellerMessageEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-message.entity'
import { ContactSellerAttachmentEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-attachment.entity'
import { ContactRequestsService } from './contact-requests.service'
import { ContactRequestsController } from './contact-requests.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImagesEntity,
      ContactSellerRequestEntity,
      ContactSellerMessageEntity,
      ContactSellerAttachmentEntity,
    ]),
    NotificationsModule,
    MailModule,
    ConfigModule,
  ],
  controllers: [ContactRequestsController],
  providers: [ContactRequestsService],
  exports: [ContactRequestsService],
})
export class ContactRequestsModule {}
