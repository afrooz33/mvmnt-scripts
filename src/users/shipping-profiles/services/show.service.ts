import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/shipping-profiles/dto'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function showService(query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.shippingProfileRepository)
      .addFilter('user', userId)
      .addFilter('status', ShippingProfileStatus.ENABLED)
      .create()

    results.condition.select([
      'id',
      'name',
      `(SELECT COUNT(*)::int FROM "shipping_zones" WHERE "shipping_zones"."shippingProfileId" = "data"."id" ) as total_zones`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
