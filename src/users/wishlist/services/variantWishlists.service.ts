import { Query } from '@app/src/shared/enums'
import { GetWishlistHasQuantityQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { toBoolean } from '@app/src/shared/helpers/DataType.helpder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (
  userId: string,
  variantId: string,
  onlyNonprofit: boolean,
): Promise<unknown> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.wishlistVariantRepository)
      .addFilter('variant', variantId)
      .addRelation(Query.WISHLIST)
      .addRelation(`${Query.WISHLIST}.${Query.IMAGE}`)
      .addRelation(`${Query.WISHLIST}.${Query.TAG}`)
      .addRelation(`${Query.WISHLIST}.${Query.USER}`)
      .addRelation(`${Query.USER}.${Query.NONPROFIT}`)
      .addRelation(`${Query.NONPROFIT}.${Query.PROFILE}`)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .create()

    results.condition.andWhere('"wishlist"."status" = :wishlistStatus', {
      wishlistStatus: WishlistStatus.PUBLIC,
    })

    if (userId) {
      results.condition.andWhere('"wishlist"."userId" = :userId', { userId })
    }

    if (toBoolean(onlyNonprofit)) {
      results.condition
        .innerJoin('users', 'users', '"wishlist"."userId" = "users"."id"')
        .andWhere('"users"."nonprofitId" IS NOT NULL')
    }

    results.condition.select([
      'data.id',
      'data.priority',
      'wishlist.title',
      'data.needs',
      `(${GetWishlistHasQuantityQuery('"wishlist"."id"', variantId)}) as "has"`,
      'wishlist.id',
      'wishlist.title',
      'wishlist.description',
      'image',
      'tag.id',
      'tag.name',
      'user.id',
      'nonprofit.id',
      'profile.id',
      'profile.first_name',
      'profile.last_name',
      'profile.foundation_name',
      'profile_image',
    ])

    return results.condition.getMany()
  } catch (error) {
    return HandleErrors(error)
  }
}
