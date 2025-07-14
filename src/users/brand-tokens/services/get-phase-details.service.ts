import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BadRequestException } from '@nestjs/common'

export async function getPhaseDetailsService(phaseId: string) {
  try {
    const phase = await this.offeringPhaseRepository.findOne({
      where: { id: phaseId },
      relations: ['offering', 'offering.brand_token', 'offering.brand_token.user'],
      select: {
        id: true,
        name: true,
        description: true,
        start_time: true,
        end_time: true,
        min_contribution: true,
        max_contribution: true,
        token_amount: true,
        token_price: true,
        vesting_period: true,
        type: true,
        requires_whitelist: true,
        min_rank: true,
        config: true,
        offering: {
          id: true,
          name: true,
          brand_token: {
            id: true,
            name: true,
            symbol: true,
            user: {
              id: true,
              email: true,
            },
          },
        },
      },
    })

    if (!phase) {
      throw new BadRequestException(ErrorKey.PHASE_NOT_FOUND)
    }

    return {
      success: true,
      data: phase,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
