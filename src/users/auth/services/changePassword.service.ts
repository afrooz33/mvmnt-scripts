import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { ChangePasswordDto } from '@app/src/shared/auth/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: ChangePasswordDto, userId: string): Promise<SuccessRO> {
  try {
    const user: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: { id: userId },
          select: ['id', 'password'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const isPasswordValid = await user.comparePassword(payload.current)

    if (!isPasswordValid) {
      throw new ForbiddenException(ErrorKey.INCORRECT_PASSWORD)
    }

    const isSamePassword = await user.comparePassword(payload.new)

    if (isSamePassword) {
      throw new BadRequestException(ErrorKey.NEW_PASSWORD_SAME_AS_CURRENT)
    }

    // Update password
    await this.userService.updateOne(
      {
        ...user,
        password: payload.new,
        reset_password_token: null,
      },
      null,
      false,
    )

    // Invalidate all sessions for this user
    await this.userSessionRepository.delete({
      user: { id: userId },
    })

    return {
      success: true,
      message: 'Password changed successfully.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
