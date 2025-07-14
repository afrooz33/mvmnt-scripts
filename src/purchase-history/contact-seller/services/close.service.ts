import { ConfigService } from '@nestjs/config'
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
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
  userId: string,
): Promise<ContactSellerRequestEntity> {
  const queryRunner = this.dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    // Fetch the request including both buyer and seller details
    const request = await queryRunner.manager.findOne(ContactSellerRequestEntity, {
      where: { id: requestId },
      relations: ['buyer', 'seller', 'order', 'order.cart', 'order.bid'],
      select: {
        id: true,
        status: true,
        buyer: { id: true, email: true, display_name: true },
        seller: { id: true, email: true, display_name: true },
        order: { id: true, cart: { id: true }, bid: { id: true } },
      },
    })

    if (!request) {
      throw new NotFoundException(`Contact request ${requestId} not found.`)
    }

    const isBuyer = request.buyer?.id === userId
    const isSeller = request.seller?.id === userId

    if (!isBuyer && !isSeller) {
      throw new ForbiddenException('You do not have permission to modify this request.')
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

    try {
      let otherPartyLinkPath: string
      let partyToNotify: { id: string; email?: string; name: string }

      const closerName = isBuyer
        ? request.buyer?.display_name || 'The buyer'
        : request.seller?.display_name || 'The seller'

      if (isBuyer) {
        partyToNotify = {
          id: request.seller.id,
          email: request.seller.email,
          name: request.seller.display_name || 'Seller',
        }
        otherPartyLinkPath = `/sales-history/contact-requests/${request.id}`
      } else {
        partyToNotify = {
          id: request.buyer.id,
          email: request.buyer.email,
          name: request.buyer.display_name || 'Buyer',
        }
        otherPartyLinkPath = `/purchase-history/contact-seller/${request.id}`
      }

      const orderId = request.order.id
      const orderDisplayId = orderId
      const orderTypeForNotification = request.order.cart
        ? 'Order'
        : request.order.bid
          ? 'Auction Win'
          : 'Order'

      await this.notificationsService.create({
        title: `Contact request closed for ${orderTypeForNotification} #${orderDisplayId}`,
        type: NotificationType.BUYER_CONTACT_SELLER,
        user: { id: partyToNotify.id },
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          requestId: request.id,
          orderId: orderId,
          closedBy: closerName,
        },
      })

      if (partyToNotify.email) {
        const configService = this.configService as ConfigService

        this.mailService.sendContactSellerNotification({
          email: partyToNotify.email,
          username: partyToNotify.name,
          buyerName: closerName,
          subject: `Contact request closed for ${orderTypeForNotification} #${orderDisplayId}`,
          messageExcerpt: `The contact request regarding ${orderTypeForNotification} #${orderDisplayId} has been closed by ${closerName}.`,
          orderId: orderDisplayId,
          linkToRequest: `${configService.get('app.userDashboardUrl')}${otherPartyLinkPath}`,
        })
      }
    } catch (notificationError) {
      console.error('Failed to send request closed notification/email:', notificationError)
    }

    return this.showOne(requestId, userId)
  } catch (error) {
    await queryRunner.rollbackTransaction()
    return HandleErrors(error)
  } finally {
    await queryRunner.release()
  }
}
