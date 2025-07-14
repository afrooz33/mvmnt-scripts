import { In } from 'typeorm'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ErrorKey, UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'
import { CreateContactRequestDto } from '@app/src/purchase-history/contact-seller/dto'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import { ContactSellerMessageEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-message.entity'
import { ContactSellerAttachmentEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-attachment.entity'

export default async function createRequestService(
  payload: CreateContactRequestDto,
  buyerId: string,
): Promise<ContactSellerRequestEntity> {
  const queryRunner = this.dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    // 1. Validate Order using orderId and Get Seller/Buyer details
    // NOTE: We query UserDealItemPaymentEntity first to easily get seller (receiver) and deal info
    const itemPayment = await queryRunner.manager.findOne(UserDealItemPaymentEntity, {
      where: { payment: { id: payload.order }, sender: { id: buyerId } },
      relations: [
        'payment',
        'sender',
        'receiver',
        'deal',
        'deal.user',
        'payment.cart',
        'payment.bid',
      ],
      select: {
        id: true,
        sender: { id: true, display_name: true, email: true },
        receiver: { id: true, display_name: true, email: true },
        deal: { id: true, name: true, deal_type: true },
        payment: {
          id: true,
          cart: { id: true },
          bid: { id: true },
        },
      },
    })

    if (!itemPayment) {
      throw new NotFoundException(
        `Order (Payment ID: ${payload.order}) not found for this buyer or does not exist.`,
      )
    }
    if (!itemPayment.receiver) {
      throw new NotFoundException('Seller information could not be determined for this order.')
    }

    const seller = itemPayment.receiver
    const buyer = itemPayment.sender
    const paymentEntity = itemPayment.payment
    const cart = paymentEntity.cart
    const bid = paymentEntity.bid

    // 2. Validate Attachments (check if UUIDs exist in Images table)
    let validAttachmentEntities: ImagesEntity[] = []
    if (payload.attachments && payload.attachments.length > 0) {
      validAttachmentEntities = await queryRunner.manager.findBy(ImagesEntity, {
        id: In(payload.attachments),
        section: UploadType.CONTACT_REQUEST_ATTACHMENT,
      })

      if (validAttachmentEntities.length !== payload.attachments.length) {
        throw new BadRequestException(ErrorKey.INVALID_REPLY_ATTACHMENT_IDS)
      }
    }

    // 3. Create Contact Request
    const newRequest = queryRunner.manager.create(ContactSellerRequestEntity, {
      buyer: { id: buyerId },
      seller: { id: seller.id },
      order: { id: paymentEntity.id },
      cart: cart ? { id: cart.id } : undefined,
      bid: bid ? { id: bid.id } : undefined,
      status: ContactRequestStatus.PENDING_SELLER_RESPONSE,
    })
    const savedRequest = await queryRunner.manager.save(ContactSellerRequestEntity, newRequest)

    // 4. Create Initial Message
    const newMessage = queryRunner.manager.create(ContactSellerMessageEntity, {
      request: { id: savedRequest.id },
      sender: { id: buyerId },
      message: payload.message,
    })
    const savedMessage = await queryRunner.manager.save(ContactSellerMessageEntity, newMessage)

    // 5. Create Attachments (linking to ImagesEntity)
    if (validAttachmentEntities.length > 0) {
      const attachmentsToSave = validAttachmentEntities.map((imgEntity) => {
        return queryRunner.manager.create(ContactSellerAttachmentEntity, {
          message: { id: savedMessage.id },
          image: { id: imgEntity.id },
        })
      })
      await queryRunner.manager.save(ContactSellerAttachmentEntity, attachmentsToSave)

      savedMessage.attachments = attachmentsToSave
    }

    await queryRunner.commitTransaction()

    // 6. Send Notifications
    const orderTypeForNotification = cart ? 'Order' : bid ? 'Auction Win' : 'Order'
    const orderDisplayId = paymentEntity.id

    // Notification to Seller
    await this.notificationsService.create({
      title: `New message regarding ${orderTypeForNotification} #${orderDisplayId}`,
      type: NotificationType.BUYER_CONTACT_SELLER,
      user: { id: seller.id },
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        requestId: savedRequest.id,
        orderId: paymentEntity.id,
        buyerName: buyer?.display_name || 'Buyer',
      },
    })

    // Email notification to Seller
    if (seller.email) {
      this.mailService.sendContactSellerNotification({
        email: seller.email,
        username: seller.display_name || 'Seller',
        buyerName: buyer?.display_name || 'A buyer',
        subject: `Inquiry about ${orderTypeForNotification} #${orderDisplayId}`,
        messageExcerpt: `${payload.message.substring(0, 100)}...`,
        orderId: orderDisplayId,
        linkToRequest: `${this.configService.get(
          'app.userDashboardUrl',
        )}/sales-history/contact-requests/${savedRequest.id}`,
      })
    }

    return this.showOne(savedRequest.id, buyerId)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    return HandleErrors(error)
  } finally {
    await queryRunner.release()
  }
}
