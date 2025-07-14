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
import { ReplyDto } from '@app/src/purchase-history/contact-seller/dto'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import { ContactSellerMessageEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-message.entity'
import { ContactSellerAttachmentEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-attachment.entity'

export default async function (
  requestId: string,
  buyerId: string,
  payload: ReplyDto,
): Promise<ContactSellerRequestEntity> {
  const queryRunner = this.dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const request = await queryRunner.manager.findOne(ContactSellerRequestEntity, {
      where: { id: requestId, buyer: { id: buyerId } },
      relations: ['seller', 'buyer', 'order', 'order.cart', 'order.bid'],
      select: {
        id: true,
        status: true,
        buyer: { id: true, display_name: true },
        seller: { id: true, email: true, display_name: true },
        order: {
          id: true,
          cart: { id: true },
          bid: { id: true },
        },
      },
    })

    if (!request) {
      throw new NotFoundException(`Contact request ${requestId} not found or access denied.`)
    }
    if (request.status === ContactRequestStatus.CLOSED) {
      throw new BadRequestException('Cannot reply to a closed request.')
    }

    // Validate Attachments
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

    // Create the new message
    const newMessage = queryRunner.manager.create(ContactSellerMessageEntity, {
      request: { id: requestId },
      sender: { id: buyerId },
      message: payload.message,
    })

    const savedMessage = await queryRunner.manager.save(ContactSellerMessageEntity, newMessage)

    // Create Attachments
    if (validAttachmentEntities.length > 0) {
      const attachmentsToSave = validAttachmentEntities.map((imgEntity) => {
        return queryRunner.manager.create(ContactSellerAttachmentEntity, {
          message: { id: savedMessage.id },
          image: { id: imgEntity.id },
        })
      })

      await queryRunner.manager.save(ContactSellerAttachmentEntity, attachmentsToSave)
    }

    // Update request status
    request.status = ContactRequestStatus.PENDING_SELLER_RESPONSE

    await queryRunner.manager.update(
      ContactSellerRequestEntity,
      { id: requestId },
      { status: ContactRequestStatus.PENDING_SELLER_RESPONSE },
    )

    await queryRunner.commitTransaction()

    // Send Notifications
    try {
      const sellerId = request.seller.id
      const sellerEmail = request.seller.email
      const orderId = request.order.id
      const orderDisplayId = orderId
      const orderTypeForNotification = request.order.cart
        ? 'Order'
        : request.order.bid
          ? 'Auction Win'
          : 'Order'

      // Notification to Seller
      await this.notificationsService.create({
        title: `Reply received for ${orderTypeForNotification} #${orderDisplayId}`,
        type: NotificationType.BUYER_CONTACT_SELLER,
        user: { id: sellerId },
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          requestId: request.id,
          orderId: orderId,
          buyerName: request.buyer?.display_name || 'Buyer',
        },
      })

      // Email notification to Seller
      if (sellerEmail) {
        this.mailService.sendContactSellerNotification({
          email: sellerEmail,
          username: request.seller.display_name || 'Seller',
          buyerName: request.buyer?.display_name || 'A buyer',
          subject: `Re: Inquiry about ${orderTypeForNotification} #${orderDisplayId}`,
          messageExcerpt: `${payload.message.substring(0, 100)}...`,
          orderId: orderDisplayId,
          linkToRequest: `${this.configService.get(
            'app.userDashboardUrl',
          )}/sales-history/contact-requests/${request.id}`,
        })
      }
    } catch (notificationError) {
      console.error('Failed to send reply notification/email:', notificationError)
    }

    return this.showOne(requestId, buyerId)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    return HandleErrors(error)
  } finally {
    await queryRunner.release()
  }
}
