import { In } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ProfileReviewDto } from '@app/src/admin/users/dto'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { IdentityVerificationStatus, VerificationStatus } from '@app/src/users/profile/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { UserAddressStatus } from '@app/src/users/address/enums'

export default async function (payload: ProfileReviewDto, userId: string): Promise<SuccessRO> {
  try {
    const identity_documents = await this.profileService.identityDocumentRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        status: VerificationStatus.REVIEW,
      },
      relations: [Query.IDENTITY_DOCUMENT_FRONT_IMAGE, Query.IDENTITY_DOCUMENT_BACK_IMAGE],
    })

    if (!identity_documents) {
      throw new PreconditionFailedException(ErrorKey.IDENTITY_DOCUMENT_NOT_FOUND)
    }

    const profile: ProfileEntity = await this.profileService.documentExists({
      condition: [
        {
          where: {
            id: payload.id,
            user: {
              id: userId,
            },
            verification_status: In([VerificationStatus.NOT_VERIFIED, VerificationStatus.REVIEW]),
            identity_verification_status: IdentityVerificationStatus.REVIEW,
          },
        },
      ],
      errorMessage: ErrorKey.PROFILE_NOT_FOUND,
    })

    const addresses = await this.addressService.findOne({
      where: {
        profile: {
          id: profile.id,
        },
        is_personal: true,
        status: UserAddressStatus.REVIEW,
      },
      select: ['id'],
    })

    if (!addresses) {
      throw new PreconditionFailedException(ErrorKey.ADDRESS_NOT_FOUND)
    }

    profile.verification_status = payload.verification_status
    profile.admin_memo = payload.admin_memo ? payload.admin_memo : null

    let message = ''

    if (payload.verification_status === VerificationStatus.VERIFIED) {
      profile.identity_verification_status = IdentityVerificationStatus.VERIFIED
      message = 'Personal identification has been approved'
    } else if (payload.verification_status === VerificationStatus.DECLINED) {
      profile.identity_verification_status = IdentityVerificationStatus.DECLINED
      message =
        'Personal identification has been rejected. Please submit your personal identification again'
    }

    await this.profileService.updateOne(profile)

    await this.profileService.identityDocumentRepository.update(
      {
        user: {
          id: userId,
        },
        status: VerificationStatus.REVIEW,
      },
      {
        status: payload.verification_status,
      },
    )

    await this.addressService.updateOne({
      id: addresses.id,
      status:
        payload.verification_status === VerificationStatus.VERIFIED
          ? UserAddressStatus.ENABLED
          : UserAddressStatus.DECLINED,
    })

    await this.notificationsService.create({
      title: 'There has been a change in the authentication status of personal identification',
      user: userId,
      type: NotificationType.PERSONAL_ID_STATUS_CHANGE,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.SERVICE,
      data: {
        message,
        document: identity_documents,
      },
    })

    return {
      success: true,
      message: `Profile [${profile.id}] successfully saved`,
      data: profile.toResponseObject(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
