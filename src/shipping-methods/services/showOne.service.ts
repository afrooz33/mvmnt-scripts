import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ShippingMethodStatus } from '@app/src/admin/shipping-methods/enums'
import { Query } from '@app/src/shared/enums'

export default async function (id: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.shippingMethodRepository)
      .addFilter('id', id)
      .addFilter('status', ShippingMethodStatus.ENABLED)
      .addRelation(Query.IMAGE)
      .addRelation(Query.TRANSLATIONS)
      .addRelation(Query.TRANSLATIONS_LANGUAGE)
      .create()

    return results.condition.getOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
