import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { UpdateAdminProfileDto } from '@app/src/admin/profile/dto'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { AccountStatus } from '@app/src/admin/user/enums'
import { AdminProfileEntity } from '@app/src/admin/profile/entities/profile.entity'

export default async function (payload: UpdateAdminProfileDto, userId: string): Promise<SuccessRO> {
  const user: AdminUserEntity = await this.adminUserService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          status: AccountStatus.ENABLED,
        },
        select: ['id', 'email', 'status'],
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: userId },
    }),
  })

  const profile: AdminProfileEntity = await this.findOne({
    where: {
      admin_user: {
        id: userId,
      },
    },
  })

  try {
    await this.adminUserService.updateOne(
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
      admin_user: user,
    }

    const updatedProfile: AdminProfileEntity = await this.updateOne(updatePayload)

    return {
      success: true,
      message: 'Profile successfully saved',
      data: updatedProfile.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
