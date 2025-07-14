import { Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { WishlistStatus } from '@app/src/users/wishlist/enums'
import { QueryDto } from '@app/src/users/wishlist/comments/dto'
import { WishlistCommentStatus } from '@app/src/users/wishlist/comments/enums'

export default async function (query: QueryDto, userId?: string): Promise<PaginateRO> {
  try {
    if (query?.parent) {
      const exists = await this.findOne({
        where: {
          id: query.parent,
          status: Not(WishlistCommentStatus.DELETED),
        },
        select: ['id'],
      })

      if (!exists) {
        throw new BadRequestException(ErrorKey.PARENT_COMMENT_DELETED)
      }
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.wishlistCommentRepository)
      .addFilter('status', WishlistCommentStatus.PUBLISHED)
      .create()

    results.condition.select([
      'data.id id',
      'data.comment comment',
      'data.created created',
      `CASE
        WHEN "data"."is_anonymous" != true
          THEN (
            SELECT json_build_object(
              'display_name', "u"."display_name",
              'username', "u"."username",
              'profile_image', "i"."url"
            )
          FROM
            "users" "u"
          LEFT JOIN "user_profiles" "p" ON "p"."userId" = "u"."id"
          LEFT JOIN "images" "i" ON "i"."id" = "p"."profileImagesId"
          WHERE "u"."id" = "data"."userId"
          ) ELSE null END AS "user"`,
      'data.is_anonymous is_anonymous',
      `CASE
        WHEN "data"."userId" = :currentUserId AND :currentUserId IS NOT NULL
          THEN true
        ELSE false
        END AS "is_owner"`,
      `(
        SELECT
          COALESCE(
            (
              SELECT
                array_to_json(
                  array_agg(
                    row_to_json(t)
                  )
                )
              FROM
                (
                  SELECT
                    rep.id,
                    rep.comment,
                    rep.created,
                    CASE WHEN rep.is_anonymous != true THEN (
                      SELECT
                        json_build_object(
                          'display_name', u.display_name,
                          'username', u.username,
                          'profile_image', i.url
                        )
                      FROM
                        users u
                        LEFT JOIN user_profiles p ON p."userId" = u."id"
                        LEFT JOIN images i ON i.id = p."profileImagesId"
                      WHERE
                        u."id" = rep."userId"
                    ) ELSE null END AS user,
                    rep.is_anonymous,
                    CASE WHEN rep."userId" = :currentUserId AND :currentUserId IS NOT NULL
                      THEN true
                      ELSE false
                      END AS is_owner
                  FROM
                    wishlist_comments rep
                  WHERE
                    rep."parentId" = data.id AND rep."status" = '${WishlistCommentStatus.PUBLISHED}'
                  ORDER BY
                    rep.created DESC
                  LIMIT
                    2
                ) t
            ),
            '[]'
          )
      ) AS "replies"`,
    ])

    results.condition.setParameters({
      currentUserId: userId ?? null,
    })

    results.condition.andWhere(
      `"data"."wishlistVariantId" IN (
        SELECT
          "wishlist_variants"."id"
        FROM
          "wishlist_variants"
        LEFT JOIN "wishlists" ON "wishlists"."id" = "wishlist_variants"."wishlistId"
        WHERE "variantId" = :variant AND "wishlistId" = :wishlist AND "wishlists"."status" != :wishlistStatus)`,
      {
        variant: query.variant,
        wishlist: query.wishlist,
        wishlistStatus: WishlistStatus.DELETED,
      },
    )

    results.condition.orderBy('data.created', 'DESC')

    if (query?.parent) {
      results.condition.andWhere('"data"."parentId" = :parent', {
        parent: query.parent,
      })
    } else {
      results.condition.andWhere('"data"."parentId" IS NULL')
    }

    return this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
