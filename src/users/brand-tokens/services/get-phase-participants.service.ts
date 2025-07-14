import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'

export async function getPhaseParticipantsService(phaseId: string): Promise<PaginateRO> {
  try {
    // Verify phase exists
    const phase = await this.offeringPhaseRepository.findOne({
      where: { id: phaseId },
    })

    if (!phase) {
      throw new BadRequestException(ErrorKey.PHASE_NOT_FOUND)
    }

    const results = new QueryBuilder({}).useQuery(this.phaseParticipantRepository).create()

    results.condition.where('data.phase.id = :phaseId', { phaseId })
    results.condition.relations = ['user']
    results.condition.select = [
      'data.id',
      'data.contribution_amount',
      'data.tokens_received',
      'data.bonus_tokens',
      'data.participated_at',
      'data.tokens_claimed_at',
      'data.has_claimed',
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
