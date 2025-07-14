import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateUserProfileDto } from '@app/src/users/profile/dto'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (payload: UpdateUserProfileDto, userId: string): Promise<SuccessRO> {
  const user: ProfileEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: Not(
            In([AccountStatus.DELETED, AccountStatus.DISABLED, AccountStatus.BLOCKED]),
          ),
        },
        select: ['id'],
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: userId },
    }),
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

    const profile: ProfileEntity = await this.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      select: ['id'],
    })

    const updatePayload = {
      ...profile,
      ...payload,
      user: user.id,
    }

    const updatedProfile: ProfileEntity = await this.updateOne(updatePayload)

    return {
      success: true,
      message: 'Profile successfully saved',
      data: {
        ...updatedProfile,
        user: user.id,
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
