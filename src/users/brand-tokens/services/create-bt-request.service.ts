import { ErrorKey } from '@app/src/shared/enums'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { Not, In } from 'typeorm'

export async function createBTRequestService(userId: string): Promise<SuccessRO> {
  try {
    const existingRequest = await this.btRequestRepository.findOne({
      where: {
        user: { id: userId },
        status: Not(
          In([
            BrandTokenRequestStatus.REJECTED,
            BrandTokenRequestStatus.COMPLETED,
            BrandTokenRequestStatus.APPROVED,
          ]),
        ),
      },
      relations: ['user'],
      select: {
        id: true,
        user: {
          id: true,
        },
      },
    })

    if (existingRequest) {
      throw new BadRequestException(ErrorKey.BRAND_TOKEN_REQUEST_EXISTS)
    }

    const request = this.btRequestRepository.create({
      user: { id: userId },
      status: BrandTokenRequestStatus.PENDING,
    })

    await this.btRequestRepository.save(request)

    return {
      success: true,
      message: 'Brand token request submitted successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
