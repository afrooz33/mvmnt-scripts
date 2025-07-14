import { SuccessRO } from '@app/shared/dto'
import { UserTypes } from '@app/shared/enums'
import { ValidationPipe } from '@app/src/shared/validations'
import { AuthLoginDto } from '@app/src/nonprofit/auth/dto'
import { NonprofitProfileDto } from '@app/src/nonprofit/profile/dto'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

export default async function (payload: AuthLoginDto): Promise<SuccessRO> {
  const user: NonprofitUserEntity = await this.nonprofitUserService.updateOne(
    {
      ...payload,
      account_type: UserTypes.NONPROFIT,
    },
    null,
    true,
  )

  const { toValidateData } = new ValidationPipe()

  await toValidateData(NonprofitProfileDto, payload)

  await this.nonprofitProfileService.create(payload, user)

  return {
    success: true,
    message: `User [${payload.email}] successfully saved`,
    data: user.toResponseObject(),
  }
}
