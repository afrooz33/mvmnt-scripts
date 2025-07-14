import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

export default async function (cartId: string, userId: string, onlyCart: boolean) {
  const cartBuilder: QueryBuilderDataInterface = new QueryBuilder({})
    .addFilter('id', cartId)
    .addFilter('user', userId)
    .addFilter('status', CartStatus.PENDING)
    .useQuery(this.buynowCartRepository)
    .create()

  if (!onlyCart) {
    cartBuilder.condition.leftJoinAndSelect('data.wishlist', 'wishlist')
    cartBuilder.condition.leftJoinAndSelect('wishlist.image', 'image')
    cartBuilder.condition.leftJoinAndSelect('wishlist.user', 'wishlist_user')
    cartBuilder.condition.leftJoinAndSelect('wishlist_user.profile', 'wishlist_profile')
    cartBuilder.condition.leftJoinAndSelect(
      'wishlist_profile.profile_images',
      'wishlist_profile_images',
    )
    cartBuilder.condition.leftJoinAndSelect('data.seller', 'seller')
    cartBuilder.condition.leftJoinAndSelect('seller.profile', 'profile')
    cartBuilder.condition.leftJoinAndSelect('data.coupon', 'coupon')
    cartBuilder.condition.leftJoinAndSelect('profile.profile_images', 'profile_images')
    cartBuilder.condition.leftJoinAndSelect('data.delivery_address', 'delivery_address')
    cartBuilder.condition.leftJoinAndSelect('delivery_address.postcode', 'postcode')

    cartBuilder.condition.select([
      'data.id',
      'data.total',
      'data.gross_donations',
      'data.net_donations',
      'data.is_anonymous',
      'wishlist.id',
      'wishlist.title',
      'wishlist.image',
      'wishlist_user.id',
      'wishlist_user.username',
      'wishlist_user.display_name',
      'wishlist_profile.id',
      'wishlist_profile_images',
      'wishlist_profile.social_accounts',
      'seller.id',
      'seller.username',
      'seller.display_name',
      'seller.available_tokens',
      'seller.prioritised_token',
      'profile.id',
      'profile_images',
      'profile.social_accounts',
      'coupon.id',
      'coupon.code',
      'delivery_address',
      'postcode',
    ])
  } else {
    cartBuilder.condition.select(['data.id', 'data.total'])
  }

  const cart = await cartBuilder.condition.getOne()

  if (!cart) {
    throw new PreconditionFailedException(ErrorKey.INVALID_CART)
  }

  return cart
}
