import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { PaymentMethodStatus } from '@app/src/users/payment-method/enums'

export default async function (query: MyPaginateDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('user', userId)
      .addFilter('is_verified', true)
      .addFilter('status', PaymentMethodStatus.ACTIVE)
      .useQuery(this.paymentWalletRepository)
      .create()

    results.condition.select(['id', 'address', 'is_internal', 'type', 'is_default'])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
