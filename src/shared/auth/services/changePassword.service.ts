import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { IAuth } from '@app/src/shared/auth/interfaces'
import { ChangePasswordDto } from '@app/src/shared/auth/dto'

export default async function <UserEntity extends IAuth>(
  payload: ChangePasswordDto,
  userId: string,
): Promise<SuccessRO> {
  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: userId },
    }),
  })

  const isInvalidPassword = await user.comparePassword(payload.current)

  if (!isInvalidPassword) {
    throw new BadRequestException(ErrorKey.INCORRECT_PASSWORD)
  }

  const updatedUser: UserEntity = await this.userService.updateOne(
    {
      ...user,
      password: payload.new,
    },
    null,
    true,
  )

  return {
    success: true,
    message: `User [${userId}] successfully updated`,
    data: updatedUser.toResponseObject(),
  }
}
