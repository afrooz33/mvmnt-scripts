import { PreconditionFailedException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { FollowType } from '@app/src/users/follower/enums'
import { QueryPublicDto } from '@app/src/users/activity-reports/dto'
import { ActivityReportStatus, FilterSection } from '@app/src/users/activity-reports/enums'

export default async function (query: QueryPublicDto, user?: string): Promise<PaginateRO> {
  try {
    if (
      (query.section === FilterSection.FOLLOWING || query.section === FilterSection.BOOKMARKED) &&
      !user
    ) {
      throw new PreconditionFailedException(ErrorKey.MISSING_USER_ID)
    }

    if (user) {
      await this.userService.documentExists({
        condition: [
          {
            where: {
              id: user,
              account_status: AccountStatus.ENABLED,
            },
            select: ['id'],
          },
        ],
        errorMessage: ErrorKey.USER_NOT_FOUND,
      })
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.activityReportsRepository)
      .addRelation(Query.USER)
      .addFilter('status', ActivityReportStatus.PUBLISHED)
      .create()

    results.condition.select([
      'data.id id',
      'data.content content',
      'data.created created',
      'user.id as user_id',
      'user.username as username',
      'user.display_name as display_name',
      `(
        SELECT 
          json_agg("image")
        FROM
          "activity_reports_assets" "assets"
        LEFT JOIN "activity_report_assets" "image" ON "assets"."activityReportAssetsId" = "image"."id"
        WHERE
        "assets"."activityReportsId" = "data"."id"
      ) AS "assets"`,
      `CASE
        WHEN user.nonprofitId IS NOT NULL THEN (
          SELECT
            json_build_object(
              'first_name', "profiles"."first_name",
              'last_name', "profiles"."last_name",
              'description', "profiles"."introduction",
              'foundation_name', "profiles"."foundation_name",
              'foundation_url', "profiles"."foundation_url",
              'image', "profile_images"."url"
            )
          FROM "nonprofit_users" "users"
          LEFT JOIN "nonprofit_profiles" "profiles" ON "users"."id" = "profiles"."userId"
          LEFT JOIN "images" "profile_images" ON "profiles"."profileImageId" = "profile_images"."id"
          WHERE "users"."id" = "user"."nonprofitId"
        )
      ELSE NULL
      END AS nonprofit_info`,
      `${
        user
          ? `
        (
          SELECT EXISTS(
            SELECT 1 FROM "activity_report_bookmarks" 
            WHERE "activityReportId" = "data"."id" AND "userId" = '${user}'
          )
        ) AS "is_bookmarked"
      `
          : 'false AS "is_bookmarked"'
      }`,
      `(
        SELECT
          COALESCE(COUNT(*), 0)::int
        FROM
          "activity_report_comments" 
        WHERE
          "activityReportId" = "data"."id"
      ) AS "total_comments"`,
      `${
        user
          ? `(
        SELECT
          CASE
            WHEN COUNT(*) > 0 THEN TRUE
            ELSE FALSE
          END AS is_following
        FROM
          "users_followers"
        WHERE
          "followingId" = "user"."id"
            AND "followerId" = '${user}'
            AND "type" = '${FollowType.NONPROFIT}'
       ) AS "is_following"`
          : 'false AS "is_following"'
      }`,
    ])

    if (query?.nonprofit_user) {
      results.condition.andWhere(
        `("user"."id" = :nonprofitUserId OR "user"."nonprofitId" = :nonprofitUserId)`,
        {
          nonprofitUserId: query.nonprofit_user,
        },
      )
    }

    if (query.section !== FilterSection.ALL && user) {
      const userIdCondition =
        query.section === FilterSection.FOLLOWING ? `"followerId" = :userId` : `"userId" = :userId`

      const table =
        query.section === FilterSection.FOLLOWING ? 'users_followers' : 'activity_report_bookmarks'

      const column =
        query.section === FilterSection.FOLLOWING ? '"followingId"' : '"activityReportId"'

      const joinColumn = query.section === FilterSection.FOLLOWING ? 'user.id' : 'data.id'

      results.condition.andWhere(
        `${joinColumn} IN (SELECT ${column} FROM ${table} WHERE ${userIdCondition})`,
        {
          userId: user,
        },
      )
    }

    if (query?.keyword) {
      results.condition.andWhere(
        `("user"."username" ILIKE :keyword OR "data"."content" ILIKE :keyword)`,
        {
          keyword: `%${query.keyword}%`,
        },
      )
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
