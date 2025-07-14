import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AdminUserRO } from '@app/src/admin/auth/dto'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'

export default async function (id: string): Promise<AdminUserRO> {
  const user: AdminUserEntity = await this.adminUserService.documentExists({
    condition: [
      {
        where: { id },
        relations: [Query.ADMIN_PROFILE, Query.ADMIN_PROFILE_LANGUAGE],
      },
    ],
    errorMessage: ErrorKey.ADMIN_NOT_FOUND,
  })

  try {
    return user.toResponseObject()
  } catch (error) {
    return HandleErrors(error)
  }
}
