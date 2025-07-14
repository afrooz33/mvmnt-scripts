import { toDataURL } from 'qrcode'
import { randomUUID } from 'crypto'
import { authenticator } from 'otplib'
import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { TwoFactorAuthRO } from '@app/src/users/auth/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (id: string, email: string): Promise<TwoFactorAuthRO> {
  const user: UserEntity = await this.checkUser(id)

  if (user.two_factor_authentication.enabled) {
    throw new PreconditionFailedException(ErrorKey.TWO_FACTOR_ALREADY_ENABLED)
  }

  if (user.two_factor_authentication.qr_code) {
    return {
      secret: user.two_factor_authentication.secret,
      qr_code: user.two_factor_authentication.qr_code,
      recovery_codes: user.two_factor_authentication.recovery_codes,
    }
  }

  const recovery_codes: string[] = []
  const secret = authenticator.generateSecret(32)

  const otpAuthUrl: string = authenticator.keyuri(email, 'MVMNT', secret)

  for (let i = 0; i < 6; i++) {
    recovery_codes.push(randomUUID())
  }

  const qr_code: string = await toDataURL(otpAuthUrl)

  await this.userService.updateOne({
    ...user,
    two_factor_authentication: {
      ...user.two_factor_authentication,
      secret,
      qr_code,
      recovery_codes,
    },
  })

  return {
    secret,
    qr_code,
    recovery_codes,
  }
}
