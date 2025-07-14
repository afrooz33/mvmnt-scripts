import { In, Not } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { ProfileVerificationDto } from '@app/src/users/profile/dto'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { IdentityVerificationStatus, VerificationStatus } from '@app/src/users/profile/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (
  payload: ProfileVerificationDto,
  userId: string,
): Promise<SuccessRO> {
  const user: ProfileEntity = await this.userService.documentExists({
    condition: [
      {
        where: {
          id: userId,
          account_status: Not(
            In([AccountStatus.DELETED, AccountStatus.DISABLED, AccountStatus.BLOCKED]),
          ),
        },
        select: ['id'],
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.USER_NOT_FOUND,
      args: { id: userId },
    }),
  })

  let profile: ProfileEntity = await this.findOne({
    where: {
      user: { id: userId },
    },
    select: ['id', 'verification_status', 'identity_verification_status'],
  })

  if (profile && profile.identity_verification_status === IdentityVerificationStatus.VERIFIED) {
    throw new PreconditionFailedException(ErrorKey.IDENTIFICATION_IS_ALREADY_VERIFIED)
  }

  if (profile && profile.identity_verification_status === IdentityVerificationStatus.REVIEW) {
    throw new PreconditionFailedException(ErrorKey.IDENTIFICATION_IS_ALREADY_IN_REVIEW)
  }

  profile = await this.updateOne({
    id: profile?.id,
    user,
    verification_status: VerificationStatus.REVIEW,
    identity_verification_status: IdentityVerificationStatus.REVIEW,
  })

  await this.addressService.create({
    status: UserAddressStatus.REVIEW,
    is_personal: true,
    ...payload.addresses,
    profile: {
      id: profile.id,
    },
  })

  await this.identityDocumentRepository.save({
    name: payload.name,
    birthday: payload.birthday,
    status: VerificationStatus.REVIEW,
    ...payload.identity_documents,
    user: {
      id: userId,
    },
  })

  await this.notificationsService.create({
    title: 'Personal identification has been submitted successfully',
    user: userId,
    type: NotificationType.PERSONAL_ID_SUBMITTED,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.USER,
    data: {
      message:
        'Personal identification has been submitted successfully/nPlease wait 1-3 days for the results of the examination',
    },
  })

  return {
    message: 'Profile successful saved.',
    success: true,
  }
}
