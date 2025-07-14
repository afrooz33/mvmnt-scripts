import { In } from 'typeorm'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { UserAddressStatus } from '@app/src/users/address/enums'
import { IdentityVerificationStatus, VerificationStatus } from '@app/src/users/profile/enums'

export default async function (userId: string) {
  try {
    const profile = await this.profileService.findOne({
      where: {
        user: {
          id: userId,
        },
        verification_status: In([VerificationStatus.NOT_VERIFIED, VerificationStatus.REVIEW]),
        identity_verification_status: IdentityVerificationStatus.REVIEW,
      },
      relations: [Query.ADDRESSES, Query.ADDRESSES_COUNTRY],
    })

    if (!profile) {
      return HandleErrors(ErrorKey.PROFILE_NOT_FOUND)
    }

    profile.addresses = await this.addressService.findOne({
      where: {
        profile: {
          id: profile.id,
        },
        is_personal: true,
        status: UserAddressStatus.REVIEW,
      },
      relations: [Query.COUNTRY, Query.POSTCODE],
    })

    return {
      ...profile.toResponseObject(),
      identity_documents: await this.profileService.identityDocumentRepository.findOne({
        where: {
          user: {
            id: userId,
          },
          status: VerificationStatus.REVIEW,
        },
        relations: [Query.IDENTITY_DOCUMENT_FRONT_IMAGE, Query.IDENTITY_DOCUMENT_BACK_IMAGE],
      }),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
