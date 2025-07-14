import { randomBytes } from 'crypto'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { NonprofitSignupDto } from '@app/src/users/auth/dto'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import {
  UserGender,
  AccountStatus,
  UserAccountType,
  EmailVerificationStatus,
} from '@app/src/users/user/enums'
import { AccountStatus as NonprofitAccountStatus } from '@app/src/nonprofit/user/enums'

export default async function (payload: NonprofitSignupDto): Promise<SuccessRO> {
  const region_settings = await this.regionSettingsService.find()

  if (!region_settings[SettingName.LOGIN_ENABLED]) {
    throw new BadRequestException(ErrorKey.SIGNUP_DISABLED)
  }

  const token = randomBytes(48)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '')

  const nonprofit_token = randomBytes(48)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '')

  const nonprofit = await this.nonprofitUserService.documentExists({
    condition: [
      {
        where: {
          id: payload.nonprofit,
          account_status: NonprofitAccountStatus.ACTIVE,
        },
        relations: [Query.PROFILE],
      },
    ],
    errorMessage: ErrorKey.NONPROFIT_PROFILE_NOT_FOUND,
  })

  const user: UserEntity = await this.userService.updateOne(
    {
      ...payload,
      gender: UserGender.NA,
      brand_url: nonprofit?.profile?.foundation_url,
      account_status: AccountStatus.DISABLED,
      account_type: UserAccountType.BUSINESS_COMPANY,
      nonprofit: {
        id: nonprofit.id,
        email: nonprofit.email,
      },
      email_verification: {
        token,
        status: EmailVerificationStatus.EMAIL_SENT,
        request_date: new Date(),
      },
      nonprofit_verification: {
        token: nonprofit_token,
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

  await this.mailService.nonprofitUserAccountVerification({
    email: nonprofit.email,
    user_email: payload.email,
    username: payload.username,
    brand_url: payload.brand_url,
    name: `${nonprofit?.profile?.first_name} ${nonprofit?.profile?.last_name}`,
    verificationLink: `${this.configService.get(
      'app.userDashboardUrl',
    )}/signup/nonprofit-verification/${user.id}?token=${nonprofit_token}&nonprofit=${nonprofit.id}`,
  })

  return {
    success: true,
    message: `User [${payload.email}] successfully saved`,
    data: user.toResponseObject(),
  }
}
