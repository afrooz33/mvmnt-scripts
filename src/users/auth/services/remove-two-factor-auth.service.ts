import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (id: string): Promise<SuccessRO> {
  const user: UserEntity = await this.checkUser(id)

  if (!user.two_factor_authentication.enabled) {
    throw new PreconditionFailedException(ErrorKey.TWO_FACTOR_AUTH_DISABLED)
  }

  await this.userService.updateOne({
    id,
    two_factor_authentication: {
      enabled: false,
      disabled_date: new Date(),
      recovery_codes: [],
      secret: null,
    },
  })

  return {
    success: true,
    message: 'Two factor authentication disabled successfully',
  }
}
