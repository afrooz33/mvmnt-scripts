import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ChangeUserEmailDto } from '@app/src/admin/users/dto'

export default async function (payload: ChangeUserEmailDto, userId: string): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: Not(In([Status.DELETED])),
          },
          select: ['id', 'email'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    if (user.email === payload.email) {
      throw new BadRequestException(ErrorKey.NEW_EMAIL_IS_THE_SAME_AS_OLD_EMAIL)
    }

    const existingEmail = await this.userService.findOne({
      where: {
        id: Not(user.id),
        email: payload.email,
        account_status: Not(In([Status.DELETED])),
      },
    })

    if (existingEmail) {
      throw new BadRequestException(ErrorKey.EMAIL_ALREADY_EXISTS)
    }

    await this.updateOne({
      ...user,
      ...payload,
    })

    return {
      success: true,
      message: 'Email changed successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
