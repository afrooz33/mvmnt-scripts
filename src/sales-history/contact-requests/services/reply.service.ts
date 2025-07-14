import { In } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ErrorKey, UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { SellerReplyDto } from '@app/src/sales-history/contact-requests/dto'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import { ContactSellerMessageEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-message.entity'
import { ContactSellerAttachmentEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-attachment.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (
  requestId: string,
  sellerId: string,
  replyDto: SellerReplyDto,
): Promise<ContactSellerRequestEntity> {
  const queryRunner = this.dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const request = await queryRunner.manager.findOne(ContactSellerRequestEntity, {
      where: { id: requestId, seller: { id: sellerId } },
      relations: ['buyer', 'seller', 'order', 'order.cart', 'order.bid'],
      select: {
        id: true,
        status: true,
        closed_at: true,
        buyer: { id: true, email: true, display_name: true },
        seller: { id: true, display_name: true },
        order: { id: true, cart: { id: true }, bid: { id: true } },
      },
    })

    if (!request) {
      throw new NotFoundException(ErrorKey.CONTACT_REQUEST_NOT_FOUND)
    }

    if (request.status === ContactRequestStatus.CLOSED) {
      throw new BadRequestException(ErrorKey.CONTACT_REQUEST_CLOSED)
    }

    // Validate Attachments
    let validAttachmentEntities: ImagesEntity[] = []

    if (replyDto.attachments && replyDto.attachments.length > 0) {
      validAttachmentEntities = await queryRunner.manager.findBy(ImagesEntity, {
        id: In(replyDto.attachments),
        section: UploadType.CONTACT_REQUEST_ATTACHMENT,
      })

      if (validAttachmentEntities.length !== replyDto.attachments.length) {
        throw new BadRequestException(ErrorKey.INVALID_REPLY_ATTACHMENT_IDS)
      }
    }

    // Create the new message
    const newMessage = queryRunner.manager.create(ContactSellerMessageEntity, {
      request: { id: requestId },
      sender: { id: sellerId },
      message: replyDto.message,
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

    // Update request status based on close_request flag
    const updateData: Partial<ContactSellerRequestEntity> = {}

    if (replyDto.close_request) {
      updateData.status = ContactRequestStatus.CLOSED
      updateData.closed_at = new Date()
    } else {
      updateData.status = ContactRequestStatus.PENDING_BUYER_RESPONSE
    }

    // Perform the update
    await queryRunner.manager.update(ContactSellerRequestEntity, { id: requestId }, updateData)

    await queryRunner.commitTransaction()

    // Send Notifications (Only if NOT closing immediately)
    if (!replyDto.close_request) {
      try {
        const buyerId = request.buyer.id
        const buyerEmail = request.buyer.email
        const orderId = request.order.id
        const orderDisplayId = orderId
        const orderTypeForNotification = request.order.cart
          ? 'Order'
          : request.order.bid
            ? 'Auction Win'
            : 'Order'

        // Notification to Buyer
        await this.notificationsService.create({
          title: `Reply received regarding ${orderTypeForNotification} #${orderDisplayId}`,
          type: NotificationType.BUYER_CONTACT_SELLER,
          user: { id: buyerId },
          receiver_type: NotificationReceiverType.USER,
          related_to: NotificationRelatedTo.DEAL,
          data: {
            requestId: request.id,
            orderId: orderId,
            sellerName: request.seller?.display_name || 'Seller',
          },
        })

        // Email notification to Buyer
        if (buyerEmail) {
          const configService = this.configService as ConfigService

          this.mailService.sendContactSellerNotification({
            email: buyerEmail,
            username: request.buyer.display_name || 'Buyer',
            buyerName: request.seller?.display_name || 'Seller',
            subject: `Re: Inquiry about ${orderTypeForNotification} #${orderDisplayId}`,
            messageExcerpt: replyDto.message.substring(0, 100) + '...',
            orderId: orderDisplayId,
            linkToRequest: `${configService.get(
              'app.userDashboardUrl',
            )}/purchase-history/contact-seller/${request.id}`,
          })
        }
      } catch (notificationError) {
        console.error('Failed to send seller reply notification/email:', notificationError)
      }
    }

    return this.showOne(requestId, sellerId)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    return HandleErrors(error)
  } finally {
    await queryRunner.release()
  }
}
