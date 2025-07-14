import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export async function getUserParticipationsService(userId: string): Promise<PaginateRO> {
  try {
    const results = new QueryBuilder({}).useQuery(this.phaseParticipantRepository).create()

    results.condition.where('data.user.id = :userId', { userId })
    results.condition.relations = [
      'phase',
      'phase.offering',
      'phase.offering.brand_token',
      'phase.offering.brand_token.user',
    ]
    results.condition.select = [
      'data.id',
      'data.contribution_amount',
      'data.tokens_received',
      'data.bonus_tokens',
      'data.participated_at',
      'data.tokens_claimed_at',
      'data.has_claimed',
      'phase.id',
      'phase.name',
      'phase.type',
      'offering.id',
      'offering.name',
      'brand_token.id',
      'brand_token.name',
      'brand_token.symbol',
      'user.id',
      'user.email',
      'user.display_name',
    ]
    results.condition.order = { participated_at: 'DESC' }

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
