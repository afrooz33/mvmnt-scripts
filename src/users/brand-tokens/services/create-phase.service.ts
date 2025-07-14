import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateOfferingPhaseDto } from '@app/src/brand-tokens/dto'

export async function createPhaseService(
  brandId: string,
  offeringId: string,
  payload: CreateOfferingPhaseDto,
): Promise<SuccessRO> {
  try {
    const offering = await this.offeringRepository.findOne({
      where: {
        id: offeringId,
        brand_token: { id: brandId },
      },
      relations: ['brand_token', 'brand_token.user'],
      select: {
        id: true,
        brand_token: {
          id: true,
          name: true,
          user: {
            id: true,
          },
        },
      },
    })

    if (!offering) {
      throw new NotFoundException(ErrorKey.BRAND_TOKEN_OFFERING_NOT_FOUND)
    }

    // TODO: Implement the rest of the method implementation...
    return {
      success: true,
      message: 'Phase created successfully',
      //Added payload to return to avoid warning in eslint
      data: payload,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
