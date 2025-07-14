import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/admin/coupons/dto'
import { CouponStatus, CouponType } from '@app/src/admin/coupons/enums'

export default async function (query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.couponsRepository)
      .create()

    if (!query.filter.coupon_type) {
      results.condition.where(`"data"."coupon_type" IN (:...coupon_type)`, {
        coupon_type: [CouponType.FREE_SHIPPING, CouponType.PERCENTAGE, CouponType.FIXED],
      })
    } else {
      results.condition.where(`"data"."coupon_type" = :coupon_type`, {
        coupon_type: query.filter.coupon_type,
      })
    }

    results.condition.andWhere(`"data"."status" NOT IN (:...coupon_status)`, {
      coupon_status: [CouponStatus.DELETED, CouponStatus.EXPIRED],
    })

    results.condition.orderBy(`"data"."end_date"`, 'DESC')

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
