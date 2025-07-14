import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateTokensDto } from '@app/src/admin/tokens/dto'

export default async function createService(payload: CreateTokensDto): Promise<SuccessRO> {
  try {
    const exist = await this.findOne({ where: { address: payload.address } })

    const token = await this.updateOne({
      ...exist,
      ...payload,
    })

    return {
      message: 'Token created successfully',
      success: true,
      data: token,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
