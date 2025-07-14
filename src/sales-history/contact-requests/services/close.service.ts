import { ConfigService } from '@nestjs/config'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (
  requestId: string,
  sellerId: string,
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
        buyer: { id: true, email: true, display_name: true },
        seller: { id: true, display_name: true },
        order: { id: true, cart: { id: true }, bid: { id: true } },
      },
    })

    if (!request) {
      throw new NotFoundException(`Contact request ${requestId} not found or access denied.`)
    }

    if (request.status === ContactRequestStatus.CLOSED) {
      throw new BadRequestException('This request is already closed.')
    }

    // Update the request status to CLOSED
    await queryRunner.manager.update(
      ContactSellerRequestEntity,
      { id: requestId },
      {
        status: ContactRequestStatus.CLOSED,
        closed_at: new Date(),
      },
    )

    await queryRunner.commitTransaction()

    // Send Notifications
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
      const closerName = request.seller?.display_name || 'The seller'

      // Notification to Buyer
      await this.notificationsService.create({
        title: `Contact request closed for ${orderTypeForNotification} #${orderDisplayId}`,
        type: NotificationType.BUYER_CONTACT_SELLER,
        user: { id: buyerId },
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          requestId: request.id,
          orderId: orderId,
          closedBy: closerName,
        },
      })

      // Email notification to Buyer
      if (buyerEmail) {
        const configService = this.configService as ConfigService
        this.mailService.sendContactSellerNotification({
          email: buyerEmail,
          username: request.buyer.display_name || 'Buyer',
          buyerName: closerName,
          subject: `Contact request closed for ${orderTypeForNotification} #${orderDisplayId}`,
          messageExcerpt: `The contact request regarding ${orderTypeForNotification} #${orderDisplayId} has been closed by ${closerName}.`,
          orderId: orderDisplayId,
          linkToRequest: `${configService.get(
            'app.userDashboardUrl',
          )}/purchase-history/contact-seller/${request.id}`,
        })
      }
    } catch (notificationError) {
      console.error('Failed to send request closed notification/email:', notificationError)
    }

    return this.showOne(requestId, sellerId)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    return HandleErrors(error)
  } finally {
    await queryRunner.release()
  }
}
