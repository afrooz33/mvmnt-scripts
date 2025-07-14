import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { GetUserWishlistDonationQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { WishlistStatus } from '@app/src/users/wishlist/enums'

export default async function (
  userId: string,
  query: MyPaginateDto,
  user: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.cartRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .create()

    results.condition.andWhere(`"data"."status" NOT IN (:...cartStatus)`, {
      cartStatus: [CartStatus.PENDING, CartStatus.CANCELLED],
    })

    results.condition.andWhere(
      `"data"."wishlistId" IS NOT NULL
        AND "data"."wishlistId" IN (
          SELECT
            "id"
          FROM
            "wishlists"
          WHERE
            "wishlists"."userId" = :userId
              AND "wishlists"."status" = :wishlistStatus
        )`,
      {
        userId,
        wishlistStatus: WishlistStatus.PUBLIC,
      },
    )

    // Helper query to count total comments by a user
    const getTotalCommentsQuery = (userIdParam: string) => `
      (SELECT 
        COUNT(*)
      FROM 
        "wishlist_ranking_comments" AS "comments"
      WHERE 
        "comments"."commenterId" = ${userIdParam}
        AND "comments"."wishlistOwnerId" = :userId)
    `

    results.condition.select([
      'data.is_anonymous is_anonymous',
      `CASE WHEN "data"."is_anonymous" THEN NULL ELSE JSON_BUILD_OBJECT(
        'id', "user"."id",
        'display_name', "user"."display_name",
        'username', "user"."username",
        'profile', JSON_BUILD_OBJECT(
          'id', "profile"."id",
          'profile_image', "profile_images"."url"
        )
      ) END AS user`,
      'COALESCE(SUM("data"."total"), 0) total_purchases',
      `(${GetUserWishlistDonationQuery(userId, '"user"."id"')}) AS total_donation`,
      `(${getTotalCommentsQuery('"user"."id"')}) AS total_comments`,
      `RANK() OVER (ORDER BY (${GetUserWishlistDonationQuery(
        userId,
        '"user"."id"',
      )}) DESC) AS rank`,
    ])

    results.condition.groupBy(
      '"user"."id", "data"."is_anonymous", "profile"."id", "profile_images"."id"',
    )

    results.condition.orderBy('total_donation', 'DESC')

    let userRanking = null

    if (user) {
      // Create a query to get the specific user's ranking data
      const userRankQuery = this.cartRepository
        .createQueryBuilder('data')
        .leftJoin('data.user', 'user')
        .leftJoin('user.profile', 'profile')
        .leftJoin('profile.profile_images', 'profile_images')
        .where(`"data"."status" NOT IN (:...cartStatus)`, {
          cartStatus: [CartStatus.PENDING, CartStatus.CANCELLED],
        })
        .andWhere(
          `"data"."wishlistId" IS NOT NULL
            AND "data"."wishlistId" IN (
              SELECT
                "id"
              FROM
                "wishlists"
              WHERE
                "wishlists"."userId" = :userId
                  AND "wishlists"."status" = :wishlistStatus
            )`,
          {
            userId,
            wishlistStatus: WishlistStatus.PUBLIC,
          },
        )
        .andWhere('"user"."id" = :user', { user })
        .select([
          'data.is_anonymous is_anonymous',
          `CASE WHEN "data"."is_anonymous" THEN NULL ELSE JSON_BUILD_OBJECT(
            'id', "user"."id",
            'display_name', "user"."display_name",
            'username', "user"."username",
            'profile', JSON_BUILD_OBJECT(
              'id', "profile"."id",
              'profile_image', "profile_images"."url"
            )
          ) END AS user`,
          'COALESCE(SUM("data"."total"), 0) total_purchases',
          `(${GetUserWishlistDonationQuery(userId, '"user"."id"')}) AS total_donation`,
          `(${getTotalCommentsQuery('"user"."id"')}) AS total_comments`,
          `RANK() OVER (ORDER BY (${GetUserWishlistDonationQuery(
            userId,
            '"user"."id"',
          )}) DESC) AS rank`,
        ])
        .groupBy('"user"."id", "data"."is_anonymous", "profile"."id", "profile_images"."id"')
        .setParameters({
          cartStatus: [CartStatus.PENDING, CartStatus.CANCELLED],
          userId,
          wishlistStatus: WishlistStatus.PUBLIC,
          user,
        })

      userRanking = await userRankQuery.getRawOne()
    }

    const result = await this.rawPaginate(results)

    return {
      ...result,
      userRanking,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
