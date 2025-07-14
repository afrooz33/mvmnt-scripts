import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/shared/dto'
import { AccountType } from '@app/src/shared/auth/enums'
import { AuthLoginDto } from '@app/src/shared/auth/dto'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { ProfileDto } from '@app/src/re2/profile/dto'

export default async function (payload: AuthLoginDto): Promise<SuccessRO> {
  const user: Re2UserEntity = await this.userService.updateOne(
    {
      ...payload,
      account_type: AccountType.RE2,
    },
    null,
    true,
  )

  const { toValidateData } = new ValidationPipe()

  await toValidateData(ProfileDto, payload)

  await this.userProfileService.create(payload, user)

  return {
    success: true,
    message: `User [${payload.email}] successfully saved`,
    data: user.toResponseObject(),
  }
}
