import { randomBytes } from 'node:crypto'
import { Request, Response } from 'express'
import { BadRequestException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { UserSignupDto } from '@app/src/users/auth/dto'
import { decodeCookieService } from '@app/src/shared/services'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import {
  UserGender,
  AccountStatus,
  UserAccountType,
  EmailVerificationStatus,
} from '@app/src/users/user/enums'

export default async function (payload: UserSignupDto, req: Request, res: Response): Promise<any> {
  const region_settings = await this.regionSettingsService.find()

  if (!region_settings[SettingName.LOGIN_ENABLED]) {
    throw new BadRequestException(ErrorKey.SIGNUP_DISABLED)
  }

  let account_status = AccountStatus.ENABLED

  if (
    [UserAccountType.BUSINESS_COMPANY, UserAccountType.BUSINESS_SOLE_PROPRIETOR].includes(
      payload.account_type,
    )
  ) {
    if (!payload.brand_url) {
      throw new BadRequestException('Brand URL is required for business account')
    }

    account_status = AccountStatus.UNDER_REVIEW
    payload.gender = UserGender.NA
  }

  const token = randomBytes(48)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '')

  const isRe2User = await this.userService.findOne({
    where: {
      email: payload.email,
      account_status: AccountStatus.DISABLED,
      account_type: UserAccountType.RE2_SHOPIFY_TEMP_USER,
    },
    select: ['id'],
  })

  const referral_code = await this.generateUniqueReferralCode(8, 5)

  const user: UserEntity = await this.userService.updateOne(
    {
      ...isRe2User,
      ...payload,
      referral_code,
      account_status,
      email_verification: {
        token,
        status: EmailVerificationStatus.EMAIL_SENT,
        request_date: new Date(),
      },
    },
    null,
    true,
  )

  await this.mailService.emailVerification({
    email: payload.email,
    username: payload.display_name,
    verificationLink: `/signup/email-verification/${user.id}?token=${token}`,
  })

  const referral_from = await decodeCookieService(req, 'x-referral-code')
  const xGuestCartId = await decodeCookieService(req, 'xGuestCartId')

  if (referral_from) {
    const referrer = await this.userService.findOne({
      where: {
        referral_code: referral_from,
      },
      select: ['id'],
    })

    if (referrer) {
      await this.invitationService.save(user.id, referrer.id)
    }
  }

  await this.eventEmitter.emit('user.signup', user)
  await this.eventEmitter.emit('user.merge.cart', {
    id: user.id,
    xGuestCartId,
  })

  return res.json({
    success: true,
    message: `User [${payload.email}] successfully saved`,
    data: user.toResponseObject(),
  })
}
