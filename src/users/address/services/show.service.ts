import { PaginateRO } from '@app/src/shared/dto'
import { Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryDto } from '@app/src/users/address/dto'
import { UserAddressStatus } from '@app/src/users/address/enums'

export default async function name(query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.addressRepository)
      .addRelation(Query.PROFILE)
      .create()

    results.condition.andWhere('profile.user.id = :userId', { userId })

    results.condition.andWhere('"data"."status" NOT IN (:...status)', {
      status: [UserAddressStatus.DELETED, UserAddressStatus.SYSTEM_DEFAULT],
    })

    results.condition.andWhere('"data"."is_personal" = :is_personal', { is_personal: false })

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
