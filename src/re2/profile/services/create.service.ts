import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ProfileDto } from '@app/src/re2/profile/dto'
import { ProfileEntity } from '@app/src/re2/profile/entities/profile.entity'

export default async function (payload: ProfileDto, user: string): Promise<SuccessRO> {
  try {
    const profile: ProfileEntity = await this.updateOne({
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
