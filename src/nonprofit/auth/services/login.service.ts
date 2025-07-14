import { ErrorKey } from '@app/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { validatePasswordMethod } from '@app/shared/services/methods'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { AuthLoginDto, NonprofitUserRO } from '@app/src/nonprofit/auth/dto'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

export default async function ({
  email,
  password,
  rememberMe,
}: AuthLoginDto): Promise<NonprofitUserRO> {
  const user: NonprofitUserEntity = await this.nonprofitUserService.documentExists({
    condition: [
      {
        where: {
          email,
          account_status: AccountStatus.ACTIVE,
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: email },
    }),
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

    return user.toResponseObject({
      type: 'bearer',
      token,
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
