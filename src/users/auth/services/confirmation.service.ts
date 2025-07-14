import { Raw } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { EmailVerificationStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (userId: string, token: string): Promise<SuccessRO> {
  const user: UserEntity = await this.userService.findOne({
    where: {
      id: userId,
      email_verification: Raw(
        () =>
          `email_verification::json->>'token' = :token AND email_verification::json->>'status' != :status`,
        {
          token: token,
          status: EmailVerificationStatus.EMAIL_VERIFIED,
        },
      ),
    },
    select: ['id', 'email', 'display_name'],
  })

  if (!user) {
    throw new PreconditionFailedException('Invalid token')
  }

  // const zendeskUser = await this.zendeskClient.users.create({
  //   user: {
  //     name: user.display_name,
  //     email: user.email,
  //     verified: true,
  //   },
  // })

  await this.userService.updateOne({
    ...user,
    // zendesk_customer_id: zendeskUser?.result?.id,
    email_verification: {
      token: null,
      status: EmailVerificationStatus.EMAIL_VERIFIED,
      verification_date: new Date(),
    },
  })

  return {
    success: true,
    message: `User [${user.email}] successfully verified`,
  }
}
