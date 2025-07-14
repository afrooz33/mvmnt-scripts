import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateEmailChangeDto } from '@app/src/users/email-change/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (payload: CreateEmailChangeDto, user: string): Promise<SuccessRO> {
  try {
    const existingUser: UserEntity = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: user,
            account_status: Not(In([Status.DELETED])),
          },
          select: ['id', 'display_name', 'email'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    if (existingUser.email === payload.email) {
      throw new BadRequestException(ErrorKey.NEW_EMAIL_IS_THE_SAME_AS_OLD_EMAIL)
    }

    const token = Math.floor(100000 + Math.random() * 900000)
    const expires_at = new Date(Date.now() + 15 * 60 * 1000)

    await this.updateOne({
      ...payload,
      token,
      expires_at,
      user: {
        ...existingUser,
      },
    })

    await this.mailService.changeEmail({
      email: payload.email,
      username: existingUser.display_name,
      token,
    })

    return {
      success: true,
      message: 'Email change request successfully saved',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
