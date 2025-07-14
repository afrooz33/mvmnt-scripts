import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { ChangePasswordDto } from '@app/src/shared/auth/dto'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { AccountStatus } from '@app/src/admin/user/enums'

export default async function (payload: ChangePasswordDto, userId: string): Promise<SuccessRO> {
  const user: AdminUserEntity = await this.adminUserService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          status: AccountStatus.ENABLED,
        },
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  const isInvalidPassword = await user.comparePassword(payload.current)

  if (!isInvalidPassword) {
    throw new BadRequestException(ErrorKey.INCORRECT_PASSWORD)
  }

  const updatedUser: AdminUserEntity = await this.adminUserService.updateOne({
    ...user,
    password: payload.new,
  })

  return {
    success: true,
    message: `Admin [${userId}] successfully updated`,
    data: updatedUser.toResponseObject(),
  }
}
