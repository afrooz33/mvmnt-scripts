import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { ErrorKey } from '@app/shared/enums'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { UpdateAdminDto } from '@app/src/admin/user/dto'
import { AdminRole } from '@app/src/admin/user/enums'

export default async function (id: string, payload: UpdateAdminDto): Promise<AdminUserEntity> {
  if (payload.role === AdminRole.OWNER) {
    throw new ForbiddenException(ErrorKey.OWNER_CANNOT_BE_CREATED)
  }

  await this.documentExists({
    condition: [
      {
        where: {
          id,
        },
      },
    ],
    message: JSON.stringify({
      key: ErrorKey.ADMIN_NOT_FOUND,
      args: { id },
    }),
  })

  try {
    if (!payload.password) {
      delete payload.password
    }

    const user: AdminUserEntity = await this.updateOne(payload)

    return user.toResponseObject()
  } catch (error) {
    throw new BadRequestException(error.message ? error.message : error)
  }
}
