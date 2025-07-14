import { randomBytes } from 'crypto'
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { AccountStatus, EmailVerificationStatus } from '@app/src/users/user/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (userId: string): Promise<SuccessRO> {
  try {
    const user: UserEntity = await this.userService.findOne({
      where: {
        id: userId,
        account_status: AccountStatus.ENABLED,
      },
    })

    if (!user) {
      throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
    }

    if (user.email_verification.status === EmailVerificationStatus.EMAIL_VERIFIED) {
      throw new UnprocessableEntityException(ErrorKey.EMAIL_ALREADY_VERIFIED)
    }

    const token = randomBytes(48)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\=/g, '')

    await this.userService.updateOne(
      {
        id: userId,
        email_verification: {
          token,
          status: EmailVerificationStatus.EMAIL_SENT,
          request_date: new Date(),
        },
      },
      null,
      false,
    )

    await this.mailService.emailVerification({
      email: user.email,
      username: user.display_name,
      verificationLink: `/signup/email-verification/${user.id}?token=${token}`,
    })

    return {
      success: true,
      message: 'Confirmation email sent',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
