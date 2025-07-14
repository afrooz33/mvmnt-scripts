import { Raw } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { AccountStatus, NonprofitVerificationStatus } from '@app/src/users/user/enums'

export default async function (
  userId: string,
  token: string,
  nonprofit: string,
): Promise<SuccessRO> {
  const user = await this.userService.findOne({
    where: {
      id: userId,
      nonprofit: {
        id: nonprofit,
      },
      nonprofit_verification: Raw(
        () =>
          `nonprofit_verification::json->>'token' = :token AND nonprofit_verification::json->>'status' != :status`,
        {
          token: token,
          status: NonprofitVerificationStatus.ACCOUNT_VERIFIED,
        },
      ),
    },
    select: ['id', 'email', 'display_name'],
  })

  if (!user) {
    throw new PreconditionFailedException('Invalid token')
  }

  await this.userService.updateOne({
    ...user,
    nonprofit_verification: {
      token: null,
      verification_date: new Date(),
      status: NonprofitVerificationStatus.ACCOUNT_VERIFIED,
    },
    account_status: AccountStatus.ENABLED,
  })

  return {
    success: true,
    message: `Nonprofit user [${user.email}] successfully verified`,
  }
}
