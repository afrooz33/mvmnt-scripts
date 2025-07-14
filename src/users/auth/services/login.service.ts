import { Not } from 'typeorm'
import { Request, Response } from 'express'
import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { decodeCookieService } from '@app/src/shared/services'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { validatePasswordMethod } from '@app/src/shared/services/methods'
import { UserLoginDto } from '@app/src/users/auth/dto'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { AccountStatus, EmailVerificationStatus, UserAccountType } from '@app/src/users/user/enums'

export default async function (
  { email, password }: UserLoginDto,
  req: Request,
  res: Response,
): Promise<any> {
  const region_settings = await this.regionSettingsService.find()

  if (!region_settings[SettingName.LOGIN_ENABLED]) {
    throw new BadRequestException(ErrorKey.LOGIN_DISABLED)
  }

  const user: UserEntity = await this.userService.documentExists({
    condition: [
      {
        where: [
          {
            email,
            account_status: Not(AccountStatus.DELETED),
            account_type: Not(UserAccountType.RE2_SHOPIFY_TEMP_USER),
          },
          {
            username: email,
            account_status: Not(AccountStatus.DELETED),
            account_type: Not(UserAccountType.RE2_SHOPIFY_TEMP_USER),
          },
        ],
        select: [
          'id',
          'email',
          'username',
          'password',
          'account_type',
          'account_status',
          'email_verification',
          'two_factor_authentication',
        ],
      },
    ],
    errorMessage: ErrorKey.USER_NOT_FOUND,
  })

  if (user.email_verification.status !== EmailVerificationStatus.EMAIL_VERIFIED) {
    throw new UnauthorizedException('Your email is not verified')
  }

  await validatePasswordMethod(user, password, ErrorKey.INVALID_CREDENTIALS)

  try {
    if (user.two_factor_authentication.enabled) {
      return user.toResponseObject()
    }

    const response = await this.getAccessToken(user, req, res)

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

    await this.eventEmitter.emit('user.merge.cart', { user, xGuestCartId })

    return response
  } catch (error) {
    return HandleErrors(error)
  }
}
