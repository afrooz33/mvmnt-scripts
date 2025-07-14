import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/re2/user/enums'
import { UpdateProfileDto } from '@app/src/re2/profile/dto'
import { ProfileEntity } from '@app/src/re2/profile/entities/profile.entity'

export default async function (payload: UpdateProfileDto, userId: string): Promise<SuccessRO> {
  const user: ProfileEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: Not(In([AccountStatus.DELETED, AccountStatus.BLOCKED])),
        },
        select: ['id'],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  const profile: ProfileEntity = await this.documentExists({
    condition: [
      {
        where: {
          user: In([userId]),
        },
        select: ['id'],
      },
    ],
    message: ErrorKey.PROFILE_NOT_FOUND,
  })

  try {
    await this.userService.updateOne(
      {
        ...user,
        ...payload,
      },
      {
        where: {
          id: userId,
        },
      },
    )

    const updatedProfile: ProfileEntity = await this.updateOne(
      {
        ...profile,
        ...payload,
        user: user.id,
      },
      {
        where: {
          id: profile.id,
          user: In([userId]),
        },
        errorKey: ErrorKey.RE2_PROFILE_NOT_FOUND,
      },
    )

    return {
      success: true,
      message: 'Profile successfully saved',
      data: {
        ...updatedProfile,
        user,
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
