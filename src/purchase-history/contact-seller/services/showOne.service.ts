import { NotFoundException, ForbiddenException } from '@nestjs/common'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'

export default async function (
  requestId: string,
  userId: string,
): Promise<ContactSellerRequestEntity> {
  try {
    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoin('request.buyer', 'buyer')
      .leftJoin('request.seller', 'seller')
      .leftJoin('request.order', 'order')
      .leftJoin('order.cart', 'cart')
      .leftJoin('cart.items', 'cart_items')
      .leftJoin('cart_items.variant', 'variant')
      .leftJoin('variant.option_values', 'option_values')
      .leftJoin('cart_items.deal', 'cart_item_deal')
      .leftJoin('order.bid', 'bid')
      .leftJoin('bid.deal', 'bid_deal')
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
      ])
      .addSelect(['buyer.id', 'buyer.display_name', 'buyer.username'])
      .addSelect(['seller.id', 'seller.display_name', 'seller.username'])
      .addSelect(['order.id', 'order.created'])
      .addSelect([
        'cart.id',
        'cart_items.id',
        'cart_items.quantity',
        'cart_items.total',
        'variant.id',
        'variant.price',
        'option_values.id',
        'option_values.value',
        'cart_item_deal.id',
        'cart_item_deal.name',
        'image.id',
        'image.url',
        'image.filename',
        'image.section',
      ])
      .addSelect(['bid.id', 'bid.quantity', 'bid.bid_amount', 'bid_deal.id', 'bid_deal.name'])
      .addSelect([
        'message.id',
        'message.message',
        'message.sent_at',
        'sender.id',
        'sender.display_name',
      ])
      .addSelect(['attachment.id', 'image.id', 'image.url', 'image.filename', 'image.section'])
      .where('request.id = :requestId', { requestId })
      .orderBy('message.sent_at', 'ASC')

    const request = await query.getOne()

    if (!request) {
      throw new NotFoundException(`Contact request ${requestId} not found.`)
    }

    if (request.buyer.id !== userId && request.seller.id !== userId) {
      throw new ForbiddenException('You do not have permission to view this request.')
    }

    return request
  } catch (error) {
    return HandleErrors(error)
  }
}
