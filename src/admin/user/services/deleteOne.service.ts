import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/admin/user/enums'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'

export default async function (id: string) {
  const admin: AdminUserEntity = await this.documentExists({
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
    await this.updateOne({
      ...admin,
      status: AccountStatus.DELETED,
    })

    return {
      success: true,
      message: 'Admin staff successfully deleted',
    }
  } catch (error) {
    throw new BadRequestException(error.message ? error.message : error)
  }
}
