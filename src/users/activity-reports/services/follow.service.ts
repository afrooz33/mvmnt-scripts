import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { FollowerDto } from '@app/src/users/follower/dto'
import { FollowType } from '@app/src/users/follower/enums'

export default async function (payload: FollowerDto, userId: string): Promise<SuccessRO> {
  try {
    if (payload.following === userId) {
      throw new Error(ErrorKey.CAN_NOT_FOLLOW_YOURSELF)
    }

    if (payload.follower === payload.following) {
      throw new Error(ErrorKey.FOLLOW_FOLLOWER_SAME_USER)
    }

    const follower = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'username'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const following = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: payload.following,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'username'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const existingFollow = await this.followersRepository.findOne({
      where: {
        follower: { id: follower.id },
        following: { id: following.id },
      },
    })

    if (existingFollow) {
      await this.followersRepository.remove(existingFollow)
    } else {
      await this.followersRepository.save({
        follower: {
          id: follower.id,
        },
        following: {
          id: following.id,
        },
        type: FollowType.NONPROFIT,
      })
    }

    return {
      success: true,
      message: 'Follow/Unfollow successfully processed',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
