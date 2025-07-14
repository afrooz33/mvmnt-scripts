import { NotAcceptableException } from '@nestjs/common'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ProfileRO } from '@app/src/nonprofit/profile/dto'
import { AccountStatus } from '@app/src/nonprofit/user/enums'

export default async function (user: any): Promise<ProfileRO> {
  const profile: NonprofitProfileEntity = await this.nonprofitProfileService.documentExists({
    condition: [
      {
        relations: [Query.USER, Query.LANGUAGE, Query.TAGS, Query.PROFILE_IMAGE],
        where: {
          user: {
            id: user.id,
          },
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: user.id },
    }),
  })

  if (profile.user.account_status !== AccountStatus.ACTIVE) {
    throw new NotAcceptableException(ErrorKey.USER_DECLINED)
  }

  try {
    return {
      ...profile.toResponseObject(),
      jwt_token: user.token,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
