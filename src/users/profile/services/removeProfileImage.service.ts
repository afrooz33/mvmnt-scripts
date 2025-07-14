import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { UploadType } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'

export default async function (id: string): Promise<SuccessRO> {
  try {
    const profile: ProfileEntity = await this.findOne({
      where: {
        user: {
          id,
          account_status: Not(
            In([AccountStatus.DELETED, AccountStatus.DISABLED, AccountStatus.BLOCKED]),
          ),
        },
      },
      select: ['id', 'profile_images'],
      relations: ['profile_images'],
    })

    if (!profile) {
      throw new BadRequestException('Profile does not exist')
    }

    if (profile.profile_images) {
      const imagePayload = {
        id: profile.profile_images.id,
        filename: profile.profile_images.filename,
        type: UploadType.USER_PROFILE_PICTURE,
      }

      profile.profile_images = null

      await profile.save()

      await this.imagesService.remove(imagePayload)
    }

    return {
      message: 'Profile image removed successfully',
      data: null,
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
