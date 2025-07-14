import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ErrorKey } from '@app/src/shared/enums'
import { InitialOfferingDto } from '@app/src/brand-tokens/dto'
import { MoreThan } from 'typeorm'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'

export async function createOfferingService(
  userId: string,
  brandId: string,
  payload: InitialOfferingDto,
): Promise<SuccessRO> {
  try {
    // Verify user has permission
    // Removed approvedRequest variable to avoid warning in eslint
    await this.documentExists({
      condition: [
        {
          where: {
            user: { id: userId },
            brand: { id: brandId },
            status: BrandTokenRequestStatus.APPROVED,
          },
        },
      ],
      errorMessage: ErrorKey.BRAND_TOKEN_REQUEST_NOT_APPROVED,
    })

    // Get token
    const token = await this.brandTokenRepository.findOne({
      where: { brand: { id: brandId } },
    })

    if (!token) {
      throw new BadRequestException(ErrorKey.BRAND_TOKEN_DETAILS_INVALID)
    }

    // Check for active offerings
    const activeOffering = await this.offeringRepository.findOne({
      where: {
        brand_token: token,
        is_ended: false,
        end_date: MoreThan(new Date()),
      },
    })

    if (activeOffering) {
      throw new BadRequestException(ErrorKey.ACTIVE_OFFERING_EXISTS)
    }

    // Create new offering
    const offering = await this.offeringRepository.save({
      brand_token: token,
      name: payload.name,
      description: payload.description,
      start_date: payload.start_time,
      end_date: payload.end_time,
      min_contribution: payload.min_contribution,
      max_contribution: payload.max_contribution,
      token_amount: payload.token_amount,
      token_price: payload.token_price,
      vesting_period: payload.vesting_period,
    })

    return {
      success: true,
      message: 'Initial offering created successfully',
      data: { id: offering.id },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
