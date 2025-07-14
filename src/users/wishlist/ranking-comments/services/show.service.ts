import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryRankingCommentsDto } from '@app/src/users/wishlist/ranking-comments/dto'

export default async function (
  query: QueryRankingCommentsDto,
  userId?: string,
): Promise<PaginateRO> {
  try {
    if (query.parent) {
      const parentExists = await this.rankingCommentRepository.findOne({
        where: { id: query.parent },
        select: ['id'],
      })
      if (!parentExists) {
        throw new NotFoundException(ErrorKey.PARENT_COMMENT_DELETED)
      }
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.rankingCommentRepository)
      .addFilter('wishlist_owner', query.wishlist_owner)
      .addFilter('ranked_user', query.ranked_user)
      .addRelation('commenter')
      .addRelation('commenter.profile')
      .addRelation('profile.profile_images')
      .addRelation('ranked_user')
      .create()

    if (query.parent) {
      results.condition.andWhere('"data"."parentId" = :parentId', { parentId: query.parent })
    } else {
      results.condition.andWhere('"data"."parentId" IS NULL')
    }

    results.condition.select([
      'data.id id',
      'data.comment comment',
      'data.created created',
      'data.likes_count likes_count',
      'data.replies_count replies_count',
      'data.is_anonymous is_anonymous',
      `CASE
        WHEN "data"."commenterId" = "data"."rankedUserId" AND "data"."is_anonymous" = TRUE
          THEN json_build_object('id', "commenter"."id")
          ELSE json_build_object(
            'id', "commenter"."id",
            'display_name', "commenter"."display_name",
            'username', "commenter"."username",
            'profile_image', "profile_images"."url"
          )
        END AS commenter`,
      `json_build_object(
          'id', "ranked_user"."id",
          'display_name', "ranked_user"."display_name",
          'username', "ranked_user"."username"
        ) AS ranked_user`,
      `CASE
          WHEN "data"."commenterId" = :userId AND :userId IS NOT NULL
          THEN TRUE
          ELSE FALSE
        END AS is_owner`,
      `CASE
          WHEN :userId IS NOT NULL AND EXISTS (
            SELECT 1 FROM "wishlist_ranking_comment_likes" "likes"
            WHERE "likes"."commentId" = "data"."id" AND "likes"."userId" = :userId
          )
          THEN TRUE
          ELSE FALSE
        END AS has_liked`,
      `(SELECT
          COALESCE(json_agg(row_to_json(t)), '[]')
        FROM (
          SELECT
            rep.id,
            rep.comment,
            rep.created,
            rep.likes_count,
            rep.is_anonymous,
            CASE
              WHEN rep."commenterId" = rep."rankedUserId" AND rep.is_anonymous = TRUE
              THEN json_build_object('id', "reply_commenter"."id")
              ELSE json_build_object(
                'id', "reply_commenter"."id",
                'display_name', "reply_commenter"."display_name",
                'username', "reply_commenter"."username",
                'profile_image', "reply_commenter_image"."url"
              )
            END AS commenter,
            CASE
              WHEN rep."commenterId" = :userId AND :userId IS NOT NULL
              THEN TRUE
              ELSE FALSE
            END AS is_owner,
            CASE
              WHEN :userId IS NOT NULL AND EXISTS (
                SELECT 1 FROM "wishlist_ranking_comment_likes" "reply_likes"
                WHERE "reply_likes"."commentId" = rep.id AND "reply_likes"."userId" = :userId
              )
              THEN TRUE
              ELSE FALSE
            END AS has_liked
          FROM
            "wishlist_ranking_comments" rep
          LEFT JOIN "users" "reply_commenter" ON "reply_commenter"."id" = rep."commenterId"
          LEFT JOIN "user_profiles" "reply_commenter_profile" ON "reply_commenter_profile"."userId" = "reply_commenter"."id"
          LEFT JOIN "images" "reply_commenter_image" ON "reply_commenter_image"."id" = "reply_commenter_profile"."profileImagesId"
          WHERE rep."parentId" = data.id
          ORDER BY rep.created DESC
          LIMIT 2
        ) t
      ) AS replies`,
    ])

    results.condition.setParameter('userId', userId ?? null)

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
