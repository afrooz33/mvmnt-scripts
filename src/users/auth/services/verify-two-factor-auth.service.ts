import { authenticator } from 'otplib'
import { Request, Response } from 'express'
import { UnauthorizedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { VerifyTwoAuthDto } from '@app/src/users/auth/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { decodeCookieService } from '@app/src/shared/services'

export default async function (
  payload: VerifyTwoAuthDto,
  req: Request,
  res: Response,
): Promise<unknown> {
  try {
    const user: UserEntity = await this.checkUser(payload.id)

    if (!user.two_factor_authentication.enabled) {
      throw new UnauthorizedException(ErrorKey.TWO_FACTOR_AUTH_DISABLED)
    }

    //check if user has recovery codes and if payload.code is in the list of recovery codes
    // if so, remove the code from the list and return an access token
    if (
      user.two_factor_authentication.recovery_codes &&
      user.two_factor_authentication.recovery_codes?.includes(payload.code)
    ) {
      const recovery_codes = user.two_factor_authentication.recovery_codes.filter(
        (code) => code !== payload.code,
      )

      await this.userService.updateOne({
        ...user,
        two_factor_authentication: {
          ...user.two_factor_authentication,
          recovery_codes,
        },
      })
    } else {
      const verificationStatus = await authenticator.verify({
        token: payload.code,
        secret: user.two_factor_authentication.secret,
      })

      if (!verificationStatus) {
        throw new UnauthorizedException(ErrorKey.INVALID_2FA_CODE)
      }
    }

    const response = await this.getAccessToken(user, req)

    //save last login and login activity
    await this.userService.updateOne(
      {
        ...user,
        last_login: new Date(),
      },
      null,
      false,
    )

    await this.userService.logLoginActivity(user)

    const xGuestCartId = await decodeCookieService(req, 'xGuestCartId')

    //emit event for merge cart
    await this.eventEmitter.emit('user.merge.cart', { id: user.id, xGuestCartId })

    return res.json(response)
  } catch (error) {
    return HandleErrors(error)
  }
}
