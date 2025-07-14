import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PaginateRO } from '@app/src/shared/dto'

export async function showBTRequestService(userId: string): Promise<PaginateRO> {
  try {
    const results = new QueryBuilder({}).useQuery(this.btRequestRepository).create()

    results.condition.where('data.user.id = :userId', { userId })
    results.condition.relations = ['brand']
    results.condition.select = [
      'data.id',
      'data.status',
      'data.admin_notes',
      'data.created',
      'data.updated',
      'data.approved_at',
      'data.rejected_at',
      'brand.id',
      'brand.name',
    ]
    results.condition.order = { created: 'DESC' }

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
