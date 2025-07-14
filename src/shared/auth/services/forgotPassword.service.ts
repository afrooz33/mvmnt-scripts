import { randomBytes } from 'crypto'
import { Not } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { IAuth } from '@app/src/shared/auth/interfaces'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ProfileEntity } from '@app/src/re2/profile/entities/profile.entity'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'

export default async function <UserEntity extends IAuth>(email: string): Promise<SuccessRO> {
  let username: string

  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          email,
          account_status: Not(Status.DELETED),
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: email },
    }),
  })

  username = user.username

  if (this.profileService) {
    const profile: NonprofitProfileEntity | ProfileEntity =
      await this.profileService.documentExists({
        condition: [
          {
            where: {
              user: {
                id: user.id,
              },
            },
          },
        ],
        errorMessage: JSON.stringify({
          key: ErrorKey.PROFILE_NOT_FOUND,
          args: { id: user.id },
        }),
      })

    username = `${profile.first_name} ${profile.last_name}`
  }

  const resetPasswordToken = randomBytes(48)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '')

  await this.userService.updateOne(
    {
      ...user,
      reset_password_token: resetPasswordToken,
    },
    null,
    true,
  )

  try {
    await this.mailService.forgotPassword({
      email,
      username,
      resetPasswordLink: `${this.params}/password-reset?user=${user.id}&token=${resetPasswordToken}`,
    })

    return {
      success: true,
      message: `User [${email}] successfully updated`,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
