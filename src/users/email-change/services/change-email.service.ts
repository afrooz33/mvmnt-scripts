import { GoneException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { ChangeEmailDto } from '@app/src/users/email-change/dto'
import { EmailChangeEntity } from '@app/src/users/email-change/entities/email-change.entity'

export default async function (payload: ChangeEmailDto, user: string): Promise<SuccessRO> {
  const changeRequest: EmailChangeEntity = await this.documentExists({
    condition: [
      {
        where: payload,
      },
    ],
    errorMessage: ErrorKey.RESOURCE_NOT_FOUND,
  })

  if (new Date(changeRequest.expires_at) < new Date()) {
    throw new GoneException(ErrorKey.EMAIL_CHANGE_EXPIRED)
  }

  await this.userService.updateOne(
    {
      id: user,
      email: changeRequest.email,
    },
    null,
    false,
  )

  await this.remove({ id: changeRequest.id })

  return {
    success: true,
    message: 'Email successfully changed',
  }
}
