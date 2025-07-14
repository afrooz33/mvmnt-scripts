import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { NonprofitProfileDto } from '@app/src/nonprofit/profile/dto'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'

export default async function (payload: NonprofitProfileDto, user: string): Promise<SuccessRO> {
  try {
    const profile: NonprofitProfileEntity = await this.updateOne({
      ...payload,
      user,
    })

    return {
      success: true,
      message: 'Profile successfully saved',
      data: profile.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
