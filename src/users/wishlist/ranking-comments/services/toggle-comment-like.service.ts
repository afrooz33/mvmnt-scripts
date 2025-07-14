import { MoreThan } from 'typeorm'
import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (commentId: string, userId: string): Promise<SuccessRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const comment = await this.rankingCommentRepository.findOne({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      throw new NotFoundException(ErrorKey.COMMENT_NOT_FOUND)
    }

    const existingLike = await this.rankingCommentLikeRepository.findOne({
      where: { comment: { id: commentId }, user: { id: userId } },
    })

    let message: string
    let data: any
    if (existingLike) {
      await this.rankingCommentLikeRepository.remove(existingLike)
      await this.rankingCommentRepository.decrement(
        { id: commentId, likes_count: MoreThan(0) },
        'likes_count',
        1,
      )
      message = 'Comment unliked successfully'
      data = {
        has_liked: false,
      }
    } else {
      const newLike = this.rankingCommentLikeRepository.create({
        comment: comment,
        user: user,
      })
      await this.rankingCommentLikeRepository.save(newLike)
      await this.rankingCommentRepository.increment({ id: commentId }, 'likes_count', 1)
      message = 'Comment liked successfully'
      data = {
        has_liked: true,
      }
    }

    data.likes_count = await this.rankingCommentLikeRepository.count({
      where: { comment: { id: commentId } },
    })

    return {
      message,
      success: true,
      data,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
