import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'

export default async function (
  requestId: string,
  sellerId: string,
): Promise<ContactSellerRequestEntity> {
  try {
    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoin('request.buyer', 'buyer')
      .leftJoin('request.seller', 'seller')
      .leftJoin('request.order', 'order')
      .leftJoin('order.cart', 'cart')
      .leftJoin('order.bid', 'bid')
      .leftJoin('request.messages', 'message')
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.attachments', 'attachment')
      .leftJoin('attachment.image', 'image')

      .select([
        'request.id',
        'request.status',
        'request.closed_at',
        'request.created',
        'request.updated',
        'buyer.id',
        'buyer.display_name',
        'buyer.username',
        'seller.id',
        'seller.display_name',
        'seller.username',
        'order.id',
        'order.created',
        'cart.id',
        'bid.id',
        'message.id',
        'message.message',
        'message.sent_at',
        'sender.id',
        'sender.display_name',
        'sender.username',
        'attachment.id',
        'image.id',
        'image.url',
        'image.filename',
      ])
      .where('request.id = :requestId', { requestId })
      .andWhere('seller.id = :sellerId', { sellerId })
      .orderBy('message.sent_at', 'ASC')

    const request = await query.getOne()

    if (!request) {
      throw new NotFoundException(`Contact request ${requestId} not found.`)
    }

    if (request.seller.id !== sellerId) {
      throw new ForbiddenException('You do not have permission to view this request.')
    }

    return request
  } catch (error) {
    return HandleErrors(error)
  }
}
