import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (id: string, userId: string): Promise<unknown> {
  try {
    await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.orderRoutingRepository)
      .addFilter('user', userId)
      .addFilter('id', id)
      .addRelation(Query.ORIGIN_GROUPS)
      .addRelation(`${Query.ORIGIN_GROUPS}.${Query.SHIPPING_ORIGIN}`)
      .addRelation(`${Query.SHIPPING_ORIGIN}.origin`)
      .create()

    const orderRouting = await result.condition.getOne()

    if (!orderRouting) {
      throw new PreconditionFailedException(ErrorKey.ORDER_ROUTING_NOT_FOUND)
    }

    return orderRouting
  } catch (error) {
    return HandleErrors(error)
  }
}
