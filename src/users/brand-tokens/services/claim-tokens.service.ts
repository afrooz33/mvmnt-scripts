import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export async function claimTokensService(userId: string, phaseId: string): Promise<SuccessRO> {
  try {
    const participation = await this.phaseParticipantRepository.findOne({
      where: {
        phase: { id: phaseId },
        user: { id: userId },
        has_claimed: false,
      },
      relations: ['phase', 'phase.offering', 'phase.offering.brand_token'],
    })

    if (!participation) {
      throw new BadRequestException('No unclaimed tokens found')
    }

    // Call blockchain service to claim tokens
    await this.brandManagerService.claimTokens(
      participation.phase.offering.brand_token.id,
      participation.tokens_received,
      participation.bonus_tokens,
    )

    // Update participation record
    participation.has_claimed = true
    participation.tokens_claimed_at = new Date()
    await this.phaseParticipantRepository.save(participation)

    return {
      success: true,
      message: 'Tokens claimed successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
