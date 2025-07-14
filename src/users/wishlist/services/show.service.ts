import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/wishlist/dto'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('user', userId)
      .useQuery(this.wishlistRepository)
      .create()

    results.condition.select([
      'data.id',
      'data.title',
      'data.status',
      'data.created',
      'data.description',
      'data.purchase_deadline',
    ])

    results.condition.andWhere('"data"."status" != :status', { status: WishlistStatus.DELETED })

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
