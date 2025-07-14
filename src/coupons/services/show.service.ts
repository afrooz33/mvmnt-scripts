import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/coupons/dto'
import { CouponStatus } from '@app/src/admin/coupons/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.couponsRepository)
      .addFilter('user', userId)
      .addFilter('status', CouponStatus.DELETED, true)
      .create()

    if (query.status) {
      results.condition.andWhere('status = :filter_status', { filter_status: query.status })
    }

    results.condition.select([
      'id',
      'code',
      'description',
      'coupon_type',
      'discount_type',
      `(
        SELECT
          COALESCE(COUNT(*), 0)::int
        FROM
          "user_deal_buynow_cart"
        WHERE
          "couponId" = "data"."id"
          AND "status" NOT IN ('${CartStatus.CANCELLED}', '${CartStatus.PENDING}')
      ) total_usage`,
      'status',
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
