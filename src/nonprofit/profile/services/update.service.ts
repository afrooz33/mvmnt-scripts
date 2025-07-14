import { In, Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UpdateNonprofitProfileDto } from '@app/src/nonprofit/profile/dto'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { AccountStatus } from '@app/src/nonprofit/user/enums'

export default async function (
  payload: UpdateNonprofitProfileDto,
  userId: string,
): Promise<SuccessRO> {
  const user: NonprofitUserEntity = await this.nonprofitUserService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: Not(AccountStatus.DELETED),
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: payload.email },
    }),
  })

  const profile: NonprofitProfileEntity = await this.documentExists({
    condition: [
      {
        where: {
          user: In([userId]),
        },
      },
    ],
    message: ErrorKey.PROFILE_NOT_FOUND,
  })

  try {
    await this.nonprofitUserService.updateOne(
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

    const updatePayload = {
      ...profile,
      ...payload,
      user: user.id,
    }

    if (payload.profile_image) {
      updatePayload.profile_image = await this.imagesService.findOne({
        where: {
          id: payload.profile_image,
        },
      })
    }

    if (payload.tags) {
      updatePayload.tags = await this.tagsService.getTags(payload.tags)
    }

    const updatedProfile: NonprofitProfileEntity = await this.updateOne(updatePayload, {
      where: {
        id: profile.id,
        user: In([userId]),
      },
      errorKey: ErrorKey.NONPROFIT_PROFILE_NOT_FOUND,
    })

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
