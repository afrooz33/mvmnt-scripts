import { In } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function validateTokenService(tokens: string[]): Promise<boolean> {
  try {
    const uniqueTokens = Array.from(new Set(tokens))

    const validTokens = await this.tokenWhitelistRepository.find({
      where: {
        address: In(uniqueTokens),
        is_whitelisted: true,
      },
      select: ['address', 'id'],
    })

    if (validTokens.length !== uniqueTokens.length) {
      throw new NotFoundException(ErrorKey.INVALID_TOKEN)
    }

    return true
  } catch (error) {
    return HandleErrors(error)
  }
}
