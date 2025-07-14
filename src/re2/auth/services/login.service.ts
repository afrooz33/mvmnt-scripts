import { ErrorKey } from '@app/shared/enums'
import { AuthLoginDto } from '@app/src/shared/auth/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { validatePasswordMethod } from '@app/shared/services/methods'
import { UserRO } from '@app/src/re2/auth/dto'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'

export default async function ({ email, password, rememberMe }: AuthLoginDto): Promise<UserRO> {
  const user: Re2UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          email,
          account_status: AccountStatus.ACTIVE,
        },
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  await validatePasswordMethod(user, password, ErrorKey.INVALID_CREDENTIALS)

  try {
    let rememberMeValidity = 0

    if (rememberMe && rememberMe === true) {
      rememberMeValidity = Math.round(Date.now() / 1000) + 86400 * 30
    }

    const token: any = await this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        account_type: user.account_type,
        rememberMe,
        rememberMeValidity,
      },
      {
        expiresIn: this.configService.get('auth.jwt.access.expiresIn'),
      },
    )

    //save last login and login activity
    await this.userService.updateOne({
      id: user.id,
      last_login: new Date(),
    })

    return user.toResponseObject({
      type: 'bearer',
      token,
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
