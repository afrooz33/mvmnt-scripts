import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { CreateRankingCommentDto } from '@app/src/users/wishlist/ranking-comments/dto'
import { WishlistRankingCommentEntity } from '@app/src/users/wishlist/ranking-comments/entities/wishlist-ranking-comment.entity'

export default async function (
  rankedUserId: string,
  commenterId: string,
  payload: CreateRankingCommentDto,
) {
  try {
    const commenter = await this.userService.documentExists({
      condition: [
        { where: { id: commenterId, account_status: AccountStatus.ENABLED }, select: ['id'] },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const rankedUser = await this.userService.documentExists({
      condition: [
        { where: { id: rankedUserId, account_status: AccountStatus.ENABLED }, select: ['id'] },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const wishlistOwner = await this.userService.documentExists({
      condition: [
        {
          where: { id: payload.wishlist_owner, account_status: AccountStatus.ENABLED },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    let parentComment: WishlistRankingCommentEntity | null = null

    if (payload.parent) {
      parentComment = await this.rankingCommentRepository.findOne({
        where: {
          id: payload.parent,
          ranked_user: { id: rankedUserId },
          wishlist_owner: { id: wishlistOwner.id },
        },
      })

      if (!parentComment) {
        throw new NotFoundException(ErrorKey.PARENT_COMMENT_DELETED)
      }
    }

    const rankingEntry = await this.cartRepository
      .createQueryBuilder('data')
      .select('data.is_anonymous', 'is_anonymous')
      .leftJoin('data.user', 'user')
      .leftJoin('data.wishlist', 'wishlist')
      .where('user.id = :commenterId', { commenterId })
      .andWhere('wishlist."userId" = :wishlistOwnerId', { wishlistOwnerId: wishlistOwner.id })
      .andWhere('wishlist.status = :wishlistStatus', { wishlistStatus: WishlistStatus.PUBLIC })
      .andWhere(`data.status NOT IN (:...cartStatus)`, {
        cartStatus: [CartStatus.PENDING, CartStatus.CANCELLED],
      })
      .orderBy('data.purchase_date', 'DESC')
      .limit(1)
      .getRawOne()

    const is_anonymous = rankingEntry ? rankingEntry.is_anonymous : false

    const comment = this.rankingCommentRepository.create({
      comment: payload.comment,
      commenter: commenter,
      parent: parentComment,
      ranked_user: rankedUser,
      wishlist_owner: wishlistOwner,
      is_anonymous: is_anonymous,
    })

    const savedComment = await this.dataSource.transaction(async (entityManager) => {
      const saved = await entityManager.save(comment)
      if (parentComment) {
        await entityManager.increment(
          WishlistRankingCommentEntity,
          { id: parentComment.id },
          'replies_count',
          1,
        )
      }
      return saved
    })

    if (!savedComment || !savedComment.id) {
      throw new InternalServerErrorException('Failed to save ranking comment.')
    }

    return {
      message: 'Comment created successfully',
      success: true,
      data: { id: savedComment.id },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
