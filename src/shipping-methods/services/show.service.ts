import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ShippingMethodStatus } from '@app/src/admin/shipping-methods/enums'
import { QueryDto } from '@app/src/shipping-methods/dto'

export default async function (query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.shippingMethodRepository)
      .addFilter('status', ShippingMethodStatus.ENABLED)
      .create()

    return this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
