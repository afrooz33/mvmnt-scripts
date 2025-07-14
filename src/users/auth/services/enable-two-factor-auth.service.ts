import { authenticator } from 'otplib'
import { UnauthorizedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { validatePasswordMethod } from '@app/src/shared/services/methods'
import { EnableTwoAuthDto } from '@app/src/users/auth/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (id: string, payload: EnableTwoAuthDto): Promise<SuccessRO> {
  const user: UserEntity = await this.checkUser(id)

  if (user.two_factor_authentication.enabled) {
    throw new UnauthorizedException(ErrorKey.TWO_FACTOR_ALREADY_ENABLED)
  }

  await validatePasswordMethod(user, payload.password, ErrorKey.INVALID_CREDENTIALS)

  const verificationStatus = await authenticator.verify({
    token: payload.code,
    secret: user.two_factor_authentication.secret,
  })

  if (!verificationStatus) {
    throw new UnauthorizedException(ErrorKey.INVALID_2FA_CODE)
  }

  await this.userService.updateOne({
    ...user,
    two_factor_authentication: {
      ...user.two_factor_authentication,
      enabled: true,
      qr_code: null,
      enabled_date: new Date(),
    },
  })

  return {
    success: true,
    message: 'Two factor authentication enabled successfully',
    data: user.toResponseObject(),
  }
}
