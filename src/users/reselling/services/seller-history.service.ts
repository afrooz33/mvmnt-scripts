import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { ResellerSellerQuery, ResellingRewardStatus } from '@app/src/users/reselling/enums'

export default async function (
  query: MyPaginateDto,
  userId: string,
  type: ResellerSellerQuery,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.resellingRewardRepository)
      .addRelation(Query.CART)
      .addRelation(Query.CART_ITEM)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere('"cart"."sellerId" = :userId', { userId })
    results.condition.andWhere('"cart"."status" NOT IN (:...cartStatus)', {
      cartStatus: [CartStatus.PENDING, CartStatus.CANCELLED],
    })

    if (type === ResellerSellerQuery.PENDING) {
      results.condition.andWhere('"data"."status" = :status', {
        status: ResellingRewardStatus.PENDING,
      })
    }

    if (type === ResellerSellerQuery.REJECTED) {
      results.condition.andWhere('"data"."status" = :status', {
        status: ResellingRewardStatus.REJECTED,
      })
    }

    results.condition.select([
      'data.id id',
      'data.scheduled_acquisition_date scheduled_acquisition_date',
      'data.acquisition_date acquisition_date',
      'data.reward_value commission_amount',
      'user.id as reseller_id',
      'user.username as reseller_username',
      'profile_images.url as reseller_profile_image',
      'user.display_name as reseller_display_name',
      'cart.id as cart_id',
      '"cart_item"."quantity" cart_item_count',
      'cart.purchase_date as purchase_date',
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
