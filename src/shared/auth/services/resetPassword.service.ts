import { Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { IAuth } from '@app/src/shared/auth/interfaces'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { ResetPasswordDto } from '@app/src/shared/auth/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function <UserEntity extends IAuth>(
  payload: ResetPasswordDto,
  userId: string,
  token: string,
): Promise<SuccessRO> {
  if (payload.newPassword !== payload.confirmPassword) {
    throw new BadRequestException(ErrorKey.PASSWORD_MISMATCH)
  }

  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: Not(Status.DELETED),
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: userId },
    }),
  })

  if (user.reset_password_token !== token) {
    throw new BadRequestException(ErrorKey.INVALID_TOKEN)
  }

  try {
    const updatedUser: UserEntity = await this.userService.updateOne(
      {
        ...user,
        password: payload.newPassword,
        reset_password_token: '',
      },
      null,
      true,
    )

    return {
      success: true,
      message: `User [${user.email}] successfully updated`,
      data: updatedUser.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
