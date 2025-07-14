import { In } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateWhitelistDto } from '@app/src/admin/tokens/dto'

export default async function updateWhitelistService(
  payload: UpdateWhitelistDto,
): Promise<SuccessRO> {
  try {
    const tokens = await this.findMany({
      where: {
        id: In(payload.tokens),
      },
    })

    if (tokens.length !== payload.tokens.length) {
      throw new BadRequestException(ErrorKey.INVALID_TOKEN)
    }

    await this.tokenWhitelistRepository.update(
      {
        id: In(payload.tokens),
      },
      {
        is_whitelisted: payload.is_whitelisted,
      },
    )

    return {
      message: 'Tokens whitelisted successfully',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
