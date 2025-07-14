import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@app/src/mail/mail.module'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { ContactSellerService } from './contact-seller.service'
import { ContactSellerController } from './contact-seller.controller'
import { ContactSellerMessageEntity } from './entities/contact-seller-message.entity'
import { ContactSellerRequestEntity } from './entities/contact-seller-request.entity'
import { ContactSellerAttachmentEntity } from './entities/contact-seller-attachment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      ImagesEntity,
      BuynowCartEntity,
      UserDealPaymentEntity,
      ContactSellerRequestEntity,
      ContactSellerMessageEntity,
      ContactSellerAttachmentEntity,
    ]),
    MailModule,
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [ContactSellerController],
  providers: [ContactSellerService],
  exports: [ContactSellerService],
})
export class ContactSellerModule {}
