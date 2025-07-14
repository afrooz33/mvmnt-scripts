import { Not, In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { EmailChangeEntity } from '@app/src/users/email-change/entities/email-change.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ResendChangeEmailDto } from '@app/src/users/email-change/dto'

export default async function (payload: ResendChangeEmailDto, userId: string): Promise<SuccessRO> {
  const existingUser: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: Not(In([Status.DELETED, Status.BLOCKED, Status.DISABLED])),
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: userId },
    }),
  })

  const changeRequest: EmailChangeEntity = await this.documentExists({
    condition: [
      {
        where: {
          email: payload.email,
          user: {
            id: existingUser.id,
          },
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.RESOURCE_NOT_FOUND,
      args: { id: userId },
    }),
  })

  const token = Math.floor(100000 + Math.random() * 900000)

  await this.mailService.changeEmail({
    email: changeRequest.email,
    username: existingUser.display_name,
    token,
  })

  await this.updateOne({
    ...changeRequest,
    token,
  })

  return {
    success: true,
    message: 'OPT successfully sent',
  }
}
