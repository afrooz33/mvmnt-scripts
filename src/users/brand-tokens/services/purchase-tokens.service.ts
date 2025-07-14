import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ErrorKey } from '@app/src/shared/enums'
import { PurchaseTokensDto } from '@app/src/brand-tokens/dto'
import { PhaseType } from '@app/src/brand-tokens/enums'
import { BigNumber } from 'bignumber.js'

export async function purchaseTokensService(
  userId: string,
  phaseId: string,
  payload: PurchaseTokensDto,
): Promise<SuccessRO> {
  try {
    // Get phase with relations
    const phase = await this.offeringPhaseRepository.findOne({
      where: { id: phaseId },
      relations: ['offering', 'offering.brand_token'],
    })

    if (!phase) {
      throw new BadRequestException(ErrorKey.BRAND_TOKEN_OFFERING_NOT_FOUND)
    }

    // Check if phase is active
    if (phase.is_ended || new Date() < phase.start_date || new Date() > phase.end_date) {
      throw new BadRequestException('Phase is not active')
    }

    // Check eligibility based on phase type
    if (phase.phase_type === PhaseType.WHITELISTED) {
      const isWhitelisted = await this.phaseWhitelistRepository.findOne({
        where: {
          phase: { id: phaseId },
          user: { id: userId },
          status: 'APPROVED',
        },
      })
      if (!isWhitelisted) {
        throw new BadRequestException('User is not whitelisted for this phase')
      }
    } else if (phase.phase_type === PhaseType.CONDITIONAL) {
      // Check conditions (rank, deals, verification)
      // TODO: Implement conditional phase logic
    }

    // Check if user has already participated
    const existingParticipation = await this.phaseParticipantRepository.findOne({
      where: {
        phase: { id: phaseId },
        user: { id: userId },
      },
    })

    // Calculate tokens to receive
    const contributionAmount = new BigNumber(payload.contribution_amount)
    const tokenPrice = new BigNumber('1000000000000000000') // Example: 1 token = 1 ETH
    const tokensToReceive = contributionAmount.dividedBy(tokenPrice)

    // Calculate bonus tokens
    const bonusTokens = tokensToReceive.multipliedBy(phase.bonus_percentage).dividedBy(100)
    const totalTokens = tokensToReceive.plus(bonusTokens)

    // Check if within purchase limits
    if (existingParticipation) {
      const totalPurchase = new BigNumber(existingParticipation.tokens_received)
        .plus(existingParticipation.bonus_tokens)
        .plus(totalTokens)

      if (totalPurchase.isGreaterThan(phase.max_purchase_limit)) {
        throw new BadRequestException('Exceeds maximum purchase limit')
      }
    }

    // Create or update participation record
    const participation =
      existingParticipation ||
      this.phaseParticipantRepository.create({
        phase,
        user: { id: userId },
      })

    participation.contribution_amount = contributionAmount.toString()
    participation.tokens_received = tokensToReceive.toString()
    participation.bonus_tokens = bonusTokens.toString()
    participation.participated_at = new Date()

    await this.phaseParticipantRepository.save(participation)

    // Update phase totals
    phase.tokens_sold = new BigNumber(phase.tokens_sold).plus(totalTokens).toString()
    await this.offeringPhaseRepository.save(phase)

    return {
      success: true,
      message: 'Token purchase successful',
      data: {
        tokens_received: tokensToReceive.toString(),
        bonus_tokens: bonusTokens.toString(),
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
